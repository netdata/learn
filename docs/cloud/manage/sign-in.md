---
title: Sign in or sign up with email, Google, or GitHub
description: Learn how signing in to Cloud works via one of our three authentication methods, plus some tips if you're having trouble signing in.
custom_edit_url: null
---

You can sign up/sign in to Netdata Cloud through one of three methods: email, Google, or GitHub. Email uses a
time-sensitive link that authenticates your browser, and Google/GitHub both use OAuth to associate your email address
with a Netdata Cloud account.

No matter the method, your Netdata Cloud account is based around your email address. Netdata Cloud does not store
passwords.

-   [Sign up to Netdata Cloud](https://app.netdata.cloud/sign-up?cloudRoute=/spaces)
-   [Sign in to Netdata Cloud](https://app.netdata.cloud/sign-in?cloudRoute=/spaces)

When you sign up for Netdata Cloud, you are first asked to agree to Netdata Cloud's [Privacy
Policy](https://www.netdata.cloud/privacy/) and [Terms of Use](https://www.netdata.cloud/terms/). You are then directed
through the Netdata Cloud onboarding process, which is explained in the [Netdata Cloud
quickstart](/docs/cloud/get-started).

## Email

To sign up/sign in with email, visit [Netdata Cloud](https://app.netdata.cloud/), enter your email address, and click
the **Sign up with email**/**Sign in with email** button.

You will soon receive an email similar to the following:

![The Netdata Cloud sign in
email](https://user-images.githubusercontent.com/1153921/100680269-691db980-332e-11eb-98df-44138e8c621d.png)

Click the **Sign up**/**Sign in** button in the email to begin using Netdata Cloud.

To use this same Netdata Cloud account on additional devices, request another sign in email, open the email on that
device, and sign in.

### Troubleshooting

You should receive your sign in email in less than a minute. The subject is **Sign up to Netdata**/**Sign in to
Netdata** and the sender is `no-reply@app.netdata.cloud` via `sendgrid.net`.

If you don't see the email, try the following:

-   Check [Netdata Cloud status](https://status.netdata.cloud) for ongoing issues with our infrastructure.
-   Request another sign in email via the [sign in page](https://app.netdata.cloud/sign-in?cloudRoute=/spaces).
-   Check your spam folder.
-   In Gmail, check the **Updates** category.

You may also want to add `no-reply@app.netdata.cloud` to your address book or contacts list, especially if you're using
a public email service, such as Gmail. You may also want to whitelist/allowlist either the specific email or the entire
`app.netdata.cloud` domain.

## Google and GitHub OAuth

When you use Google/GitHub OAuth, your Netdata Cloud account is associated with the email address that Netdata Cloud
receives via OAuth.

To sign in/sign up with Google or GitHub OAuth, visit [Netdata Cloud](https://app.netdata.cloud/) and click the
**Continue with Google/GitHub** or button. Enter your Google/GitHub username and your password. Complete two-factor
authentication if you or your organization has it enabled. 

You are then signed in to Netdata Cloud or directed to the new-user onboarding if you have not signed up previously.

## Reset a password

Netdata Cloud not store passwords and does not support password resets. All of our sign in/sign up methods do not
require passwords, and use either links in emails or Google/GitHub OAuth for authentication.

## Switch between sign in/sign up methods

You can switch between sign in methods if the email account associated with each method is the same.

For example, you first sign in via your email account, `user@example.com`, and later sign out. You later attempt to sign
in via a GitHub account associated with `user@example.com`. Netdata Cloud recognizes that the two are the same and signs
you in to your original account.

However, if you first sign in via your `user@example.com` email account and then sign in via a Google account associated
with `user2@example.com`, Netdata Cloud creates a new account and begins the onboarding process.

It is not currently possible to link an account created with `user@example.com` to a Google account associated with
`user2@example.com`.

## What's next? 

If you haven't already onboarded to Netdata Cloud and claimed your first nodes, visit the [get started
guide](/docs/cloud/get-started).

For other questions, see the [frequently asked questions](/docs/cloud/faq-glossary).
