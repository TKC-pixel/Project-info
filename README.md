Overview
BET.Voucher.Redemption.Iframe is an ASP.NET Core MVC app that renders a voucher redemption form meant to be embedded as an iframe inside a host site or app. A customer picks the voucher provider, enters the voucher number, and the app validates it and submits it to the crediting service.
The same page serves several surfaces. The devicePlatform query value switches the layout between a current web view, a new web view, a premium view and a mobile view. The Tenant value from site configuration switches branding between platforms (for example the lfsite tenant). All text comes from LanguageConfigs.json, so the form is available in English and Portuguese.
The app also protects the crediting service from guessing: failed attempts are tracked per voucher attempt, and the user is locked out with a countdown after repeated invalid vouchers.
Project structure
Namespace: BET.Voucher.Redemption.Iframe. These are the files visible in the solution tabs.
File

Role

HomeController.cs

Single controller. GET Index builds the form model; POST Index validates, rate-limits and submits the voucher.

Index.cshtml

Main view: provider buttons, hidden fields, voucher input, submit button, help modal and the startup script.

Premium.cshtml

Partial rendered for the premium platform. Also holds the shared .btn-provider styles used outside the web layouts.

_ValidationScripts partial

Client-side validation script (loaded in Index.cshtml's tab group).

_Layout.cshtml, _ViewImports.cshtml

Standard MVC layout and shared imports.

LanguageConfigs.json

Localised strings, one object per language under a Languages array.

LanguageConfiguration.cs

C# type that binds LanguageConfigs.json.

SyxClientModel.cs

Client model used by the integration (not covered by the screenshots).

Controller dependencies
The controller receives these through constructor injection:
Dependency

Used for

ICreditingService

SubmitVoucher(model) and IsInvalidVoucher(message).

IVoucherAttemptService

Tracks failed attempts, decides if a voucher is blocked, computes the countdown and builds the blocked message.

IOptions<SiteConfiguration>

Tenant, enabled providers, wait time and attempt thresholds.

VoucherRedemptionModelValidator

Validation rules for the posted model.

ILocalizedStringProvider

Localised labels and error messages.

Entry parameters
The iframe is opened with GET /Home/Index and these parameters.
Parameter

Type

Default

Purpose

clientId

string

none

Identifies the calling client. Round-tripped as a hidden field.

devicePlatform

string

currentmob (in the view)

Selects the layout and the default provider.

theme

Theme

Theme.Light

Visual theme passed through to the model.

language

UserLanguage

UserLanguage.English

Language for all text. Also stored in session as SelectedLanguage.

Device platform values
The view compares devicePlatform case-insensitively:
Value

Layout

currentweb

Current web layout. Simple provider buttons, no help link.

newweb

New web layout. Same simple buttons as current web.

premium

Premium layout via the Premium partial. Heading is hidden and the voucher input shows a placeholder.

anything else (default currentmob)

Mobile layout with the styled provider buttons and check icon.

On the first load, GET Index also sets ViewBag.Tenant from _config.TenantPlatform, picks the starting provider with GetProvider(devicePlatform), and copies every localised string onto the model.
Request flow
Every submit goes through POST Index(VoucherRedemptionModel model). It first checks whether this voucher attempt is locked out, then validates, then submits to the crediting service. ViewBag.RemainingTime carries the lockout seconds to the view, and every path ends by returning the form.

POST Index flow · 3 decisions, 3 branches
A blocked attempt skips validation and shows the lockout. An invalid model returns the form, and records a failed attempt when the error is an invalid voucher. A valid model is submitted, and an invalid-voucher response updates the countdown. A success returns the view with no lockout.
Provider selection UI
Index.cshtml loops over every value of ProviderEnum and renders one button per provider. A provider is skipped when its flag in Model.EnableProvider is false.
Provider

Display name used for the flag lookup

Enable flag

Icon

HollyTopUp

HollyTopUp

EnableHollyTopUp

/images/purple-hwb-star.png

Easyload

EasyLoad

EnableEasyload

/images/easyload-dark.png

Ott

OTT

EnableOtt

/images/ott-logo.png

Flash

1Voucher

EnableFlash

/images/1Voucher-logo.png

Blu

Blu Voucher

EnableBlu

/images/blu-voucher-logo.png

RandACellular

R&A Cellular

EnableRandA

/images/randa-cellular-logo.png

EasyPay

EasyPay

EnableEasyPay

/images/easypay.png

How a button renders
• The label comes from EnumHelper<ProviderEnum>.GetDisplayValue(item), and that string is also the key into providerConfigMap that decides whether the provider is enabled.
• On the mobile and premium layouts the button shows a check icon. The selected provider gets the selected-provider class and the btn-provider-icon-active icon; the others use btn-provider-icon, which is hidden with display: none.
• On currentweb and newweb the button is simpler and the selected provider gets an active class.
• A provider counts as selected when it equals Model.Provider and Model.DefaultVoucherProvider is false.
Default provider checkbox
enabledProvidersCount is the number of enabled providers. showDefaultVoucherProviderCheckbox is true when that count is greater than 2. When true, the form shows a checkbox bound to DefaultVoucherProvider so a customer who does not know their provider can proceed without choosing one.
Help link and modal
When the layout is not current web or new web, and the checkbox is not shown, a "Click here for help" link opens the #toggleHelp modal. The modal explains how to recognise each enabled provider from the text and logo on the voucher. The modal title and link text come from HowToChooseProviderTitle, ClickHereForHelp and Here.
Localisation
LanguageConfigs.json holds a Languages array. Each entry has a Type (Portuguese, English) and the same set of string keys. ILocalizedStringProvider reads the entry for the selected language, and the controller copies the values onto VoucherRedemptionModel.
Group

Keys

Widget text

HeaderNameWidget, SubHeadingWidget, ButtonTitleWidget, EnterVoucherNumber

Validation errors

VoucherNumberNullError, VoucherError, VoucherLengthError, ExpiredErrorMessage, DeviceRequired

Service errors

TryAgainErrorMessage, TimeOutErrorMessage, GenericErrorMessage, GenericShortenedError

Attempt limiting

GenericErrorMessageWithCounter, TenthVoucherAttempt, CountdownMessageSeconds, CountdownMessageMinutes, VoucherAttemptTryAgainMessage

Success

SuccessMessage

Provider help

HowToChooseProviderTitle, HollyTopUpHelpText, EasyLoadHelpText, OTTHelpText, OneVoucherHelpText, BluVoucherHelpText, RandAHelpText, EasyPayHelpText, ClickHereForHelp, Here

Non-text values

SyxSession (SYX_SESSION), VoucherRedemptionAttempt

Placeholders
Some strings use positional placeholders filled with string.Format or Split("{0}"):
• GenericErrorMessageWithCounter: {0} is the number of attempts remaining.
• CountdownMessageSeconds: {0} is the seconds left.
• CountdownMessageMinutes: {0} is minutes and {1} is seconds.
• Provider help texts: {0} is the provider name (twice in most texts, once in RandAHelpText).
• ClickHereForHelp: {0} marks where the Here button is inserted.
The language is chosen from the language entry parameter. It is stored in session as SelectedLanguage and posted back in the hidden Language field.
Configuration
The app binds a SiteConfiguration section through IOptions<SiteConfiguration>. The settings the code reads are:
Setting

Used for

TenantPlatform

Put in ViewBag.Tenant. The view checks it for lfsite to adjust the premium input styling.

EnableProvider

Per-provider on/off flags (EnableHollyTopUp, EnableEasyload, EnableOtt, EnableFlash, EnableBlu, EnableRandA, EnableEasyPay). Drives which buttons and help texts show.

TimeToWait

Base lockout time passed to GetRemainingTime.

AttemptsBeforeCountDown

Number of invalid attempts allowed before the countdown starts.

The exact JSON key names and default values were not visible in the screenshots. Add them here from appsettings.json once confirmed.
Hidden fields and client-side behaviour
The form posts back to Home/Index (asp-controller="Home" asp-action="Index"). State is carried in hidden inputs rather than in session, so the POST model is rebuilt from the form.
Group

Hidden fields

Context

ClientId, DevicePlatform, Theme, Language

Selection

Provider, HasVoucherProvider, ToggleHelpText

Lockout

RemainingTimeInSeconds (from ViewBag.RemainingTime)

Localised text

VoucherNumberNullError, VoucherError, VoucherLengthError, TryAgainErrorMessage, TimeOutErrorMessage, CountdownMessageSeconds, CountdownMessageMinutes, VoucherAttemptTryAgainMessage, HeaderNameWidget, SubHeadingWidget, ButtonTitleWidget

Visible inputs: the DefaultVoucherProvider checkbox (when shown), the VoucherNumber field (type="number") and the btnSubmit button. Two <span role="alert"> elements hold the error and success messages (alert-danger, alert-success).
On page ready, $.fn.StartVrw(...) is called with the premium flag as a lowercase string. The script that defines it was not visible in the screenshots, so its behaviour (client validation, countdown rendering from RemainingTimeInSeconds, provider selection) should be documented once confirmed.
Extending the iframe
Add a provider
1. Add the value to ProviderEnum with a display name.
2. Add an Enable<Provider> flag to the EnableProvider settings class and to configuration.
3. In Index.cshtml, add the icon to voucherProviderIcons, add an if (Model.EnableProvider.Enable<Provider>) enabledProvidersCount++; line, and add an entry to providerConfigMap keyed by the exact display name.
4. Add a help text block to the help modal and a <Provider>HelpText key to every language in LanguageConfigs.json.
5. Add the logo to wwwroot/images.
6. Check the default-provider checkbox threshold still behaves as intended.
Add a language
7. Add a value to UserLanguage.
8. Add a new object to Languages in LanguageConfigs.json with a Type and every key present in the existing languages.
9. Confirm ILocalizedStringProvider maps the new enum value to the Type string.
Add a device platform
Add the case to GetProvider(devicePlatform) in the controller helpers and to the isCurrentWeb / isNewWeb / Premium checks at the top of Index.cshtml if the layout should differ.
Known issues and open questions
These came up while reading the code. None are confirmed bugs.
• Checkbox threshold mismatch. The code comment says the "I don't know" checkbox shows when more than 1 provider is enabled, but showDefaultVoucherProviderCheckbox uses enabledProvidersCount > 2.
• Help modal is not localised. The modal text for EasyLoad, OTT, 1Voucher, Blu, R&A Cellular and EasyPay is hard-coded English in Index.cshtml, although matching *HelpText keys exist in LanguageConfigs.json. Only HollyTopUp uses its localised string.
• Provider flag lookup by display name. providerConfigMap matches on display-name strings. If a display name changes, TryGetValue fails and the provider is shown even when disabled.
• Lockout wording is hard-coded. GenericErrorMessageWithCounter and TenthVoucherAttempt mention 10 seconds and 15 minutes in the text, while the real timing comes from TimeToWait and AttemptsBeforeCountDown. Changing config would leave the wording out of date.
• Unclear handling of non-voucher errors. In POST Index, a response with HasError that is not an invalid-voucher error only reaches the final return View(model). The screenshots do not show where response.ErrorMessage is copied to the model, or how success is rendered. Worth confirming.
• type="number" input. Number inputs drop leading zeros and can behave oddly with long values. If any provider uses vouchers that start with 0, a text input with inputmode="numeric" is safer.
• Localised text round-trips through the form. Many message strings are posted back as hidden fields and bound to the model. They are display text only, but they could be re-read from ILocalizedStringProvider on POST instead.
• Html.Partial("Premium"). Synchronous partial rendering is discouraged in ASP.NET Core. <partial name="Premium" /> or await Html.PartialAsync(...) avoids that.
