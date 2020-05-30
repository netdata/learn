---
title: Sign in with email, Google, or GitHub
description: Learn how signing in to Cloud works via one of our three authentication methods, plus some tips if you're having trouble signing in.
custom_edit_url: null
---

You can sign in to Netdata Cloud through one of three methods&mdash;email, Google, or GitHub&mdash;all of which are
passwordless. Sign in via email uses a time-sensitive link that authenticates your browser, and Google/GitHub both use
OAuth to associate your email address with a Netdata Cloud account.

No matter the method, your Netdata Cloud account is based around your email address. Every time you sign in to Cloud
with a different email address, you create a new account. Read more about [switching between
methods](#switch-between-sign-in-methods).

Netdata Cloud does not support username+password authentication.

When you first sign in to a new account, you are directed through the Netdata Cloud onboarding process. See the [get
started guide](/docs/cloud/get-started) for details.

## Email

To sign in with email, visit the [sign in page](https://app.netdata.cloud/sign-in?cloudRoute=/spaces), enter your email
address, and click the **Access** button:

![The Netdata Cloud sign in screen](/img/docs/cloud/signin_email-start.png)

You will soon receive an email like the following:

![The Netdata Cloud sign in email](/img/docs/cloud/signin_email-body.png)

Click the **Sign in** button to sign in to Netdata Cloud.

To sign in on additional devices, request another sign in email, open the email on that device, and click the **Sign
in** button again.

### No sign in email

You should receive your sign in email in less than a minute. The subject is **Sign In to Netdata** and the sender is
`no-reply@app.netdata.cloud` via `sendgrid.net`.

If you don't see the email, try the following:

-   Check [Netdata Cloud status](https://status.netdata.cloud) for ongoing issues with our infrastructure.
-   Request another sign in email via the [sign in page](https://app.netdata.cloud/sign-in?cloudRoute=/spaces).
-   Check your spam folder.
-   In Gmail, check the **Updates** category.

You may also want to add `no-reply@app.netdata.cloud` to your address book or contacts list, especially if you're using
a public email service, such as Gmail. You may also want to whitelist/allowlist either the specific email or the entire
`app.netdata.cloud` domain.

## GitHub

To sign in with GitHub OAuth, visit the [sign in page](https://app.netdata.cloud/sign-in?cloudRoute=/spaces) and click
the **Sign in with GitHub** button.

![The GitHub method on the Netdata Cloud sign in screen](/img/docs/cloud/signin_github-start.png)

Next, enter your GitHub username and your password. Complete two-factor authentication enabled if you or your
organization has it enabled.

You are automatically redirected to your Netdata Cloud account.

## Google

To sign in with Google OAuth, visit the [sign in page](https://app.netdata.cloud/sign-in?cloudRoute=/spaces) and click
the **Sign in with Google** button.

![The Google method on the Netdata Cloud sign in screen](/img/docs/cloud/signin_google-start.png)

Next, enter your Google email address and your password. Complete two-factor authentication enabled if you or your
organization has it enabled.

You are automatically redirected to your Netdata Cloud account.

## Reset a password

Netdata Cloud does support password resets. All of the available sign in methods do not require a password, and we do
not store any passwords to reset/recover. If you forgot which email account you initially used to sign in to Netdata
Cloud, use the [email](#email) method with your personal and/or work email accounts to find the matching account.

## Switch between sign in methods

You can switch between sign in methods if the email account associated with each method is the same.

For example, you first sign in via your email account, `user@example.com`, and later sign out. You later attempt to sign
in via a GitHub account associated with `user@example.com`. Netdata Cloud recognizes that the two are the same and signs
you in to your original account.

However, if you first sign in via your `user@example.com` email account and then sign in via a Google account associated
with `user2@example.com`, Netdata Cloud creates a new account and begins the onboarding process.

It is not currently possible to link an account created with `user@example.com` to a Google account associated with
`user2@example.com`.

## What's next? 

Have questions about signing in? Read up about [resetting a password](/docs/cloud/manage/recover-reset-password.md) or
our [frequently asked questions](/docs/cloud/faq-glossary).
