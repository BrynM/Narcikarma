*****

[Narcikarma](http://i.imgur.com/UBVs4.png#nkma "Click for screenshot...")

*****

Narcikarma is a Google Chrome extension for keeping your Karma progress here at Reddit right on the Chrome toolbar.
It was written by badmonkey0001.

At a glance you can check your narcissistic progress, meaning you can stop using F5 as a weapon to see if you've been upvoted (saving finger strain, keyboard wear-and-tear, and perhaps time from Reddit being overloaded).

*****

The recent versions are for light testing on the path to 0.51 becoming available.
0.51 will be the first full-featured release and the start of the official beta.

**It is highly recommended that you reset to the default options when upgrading for the time being.**

*****

## Features

* Two icon lines of configurable display. Each line can show gained/lost link karma, gained/lost comment karma, or status flags about your account.
* Popup panel featuring karma totals, cake day, user flags and links.
* Configurable desktop notifications for mail, modmail, and karma gain/loss.
* Configurable refresh interval.
* Configurable icon colors.
* Doesn't conflict with RES or any other Reddit-centric extensions.
* Simple, out-of-the-way, and easy to use.
* Created with privacy in mind. Minimal data footprint.
* Open Source - do you want to [contribute](https://github.com/BrynM/Narcikarma)?

## What's new:

### [0.5015](https://github.com/BrynM/Narcikarma/pull/77)

* better popup layout and visual fixes
* new color options for gained link and comment karma
* fixed notification click issue
* upgraded analytics and new privacy options/prompt
* build system using grunt (for devs)
* new configurable alerts for karma loss

### 0.5013

* Fixed cookie permission issue resulting in no data
* Total karma implemented in popup and icon
* New defaults
* Lots of code fixes and improvements (with some pre 0.51 cruft remaining)
* Configurable desktop notifications for karma gains and messaging
* New API data added to popup (total karma, inbox count, over 18, gold credits)
* Now all settable colors can be edited
* New color settings (mail, modmail)
* Popup way more efficient

*****

## Get It

[Get Narcikarma for Google Chrome](https://chrome.google.com/webstore/detail/narcikarma/mogaeafejjipmngijfhdjkmjomgdicdg)

**Latest Version:** [0.5016](https://github.com/BrynM/Narcikarma/releases)

**Release Status:** Open Evaluation Beta

**[FAQ](https://github.com/BrynM/Narcikarma#faq)** **[Credits](https://github.com/BrynM/Narcikarma#credits)**

*****

## Known Issues

* Somewhat stable at the moment! Woohoo!

*****

## Todo

The todo list for 0.51 can be found [here](https://github.com/BrynM/Narcikarma/milestones/0.51).

*****

## Disclaimer

/r/Narcikarma is a text-only subreddit, so please keep the fact that you won't be getting karma for posting there in mind. Official posts have an [orange user tag](http://www.reddit.com/r/Narcikarma/#nkOfficialPosts).

*****

## FAQ

* Where can I get help?
    * Go post in [/r/Narcikarma](http://www.reddit.com/r/Narcikarma)!
* Where can report a problem?
    * Go post in [/r/Narcikarma](http://www.reddit.com/r/Narcikarma)!
* Where can suggest a feature?
    * Go post in [/r/Narcikarma](http://www.reddit.com/r/Narcikarma)!
* Is Narcikarma Open Source?
    * Yes. It's [GPLv3](https://github.com/BrynM/Narcikarma/blob/master/gplv3.txt)
    * The other tools used by Narcikarma have their own licenses. They are listed in the credits.
* The icon says "ERR/ERR" or "CON/ERR". What does that mean?
    * If you can't connect to Reddit (down, lost network, etc.) "ERR/ERR" or "CON/ERR" will show on the icon.
* The icon says "LOGIN/LOGIN". What does that mean?
    * You are not logged into reddit.com. The extension uses your existing login through your browser to do its job. Please log into reddit.com.
* Can you add a(nother) icon/textbox/image/graph/readout?
    * No. For good reason, Chrome limits each extension to a single 16x16 toolbar icon as far as the main window goes. This helps them avoid the malware toolbar hell that other browsers are prone to.
* Can you report what links/comments got upvoted?
    * With a lot of work, probably. The thing is, I don't want to do that work. It would severly complicate the extension and make it far less lightweight. You should go to Reddit sometime right?
* I saw a UTM pixel. Are you gathering analytics? Private information?
    * Narcikarma does not interact with or alter Reddit pages in any way. Only minimal JSON APIs are used, such as me.json. No browsing data is colledted at all.
    Authentication is carried out by sharing cookies with reddit.com to make the JSON API requests. The cookies are not viewed, used, or stored anywhere and this functionality is completey controlled by the browser. The only account data stored is locally in your browser to report to you and is never transmitted to anyone else.
    In the end, I don't want to know what you do. This is meant to merely be a tool you can use.

    * In order to see how much of the extension is used and track how many errors are thrown, it's very helpful to collect usage data. Narcikmara only collects basic anonymous Google Analytics event data and internal function call counts as Analytics events. No data about your accounts - Reddit, Google, or otherwise - is collected at all. By default, Google Analytics does collect some location data however.
    The data collected is primarily used to evaluate which portions of the code are getting used and which options are popular so they can become new defaults.

    * Please feel free to examine the [source code](https://github.com/BrynM/Narcikarma "The actual source code on Github...") or the console to verify this.

*****

## Credits

* Creator
    * badmonkey0001 (Bryn Mosher)
* Tools
    * [bpmv](https://github.com/BrynM/bpmv)
    * [Google Chrome](http://www.google.com/chrome)
    * [jQuery](http://jquery.com)
    * [Reddit](http://www.reddit.com/)
    * [Sublime Text 2](http://www.sublimetext.com/2)
* Developers
    * badmonkey0001 (Bryn Mosher)
* Alpha Testers
    * evilmarc
    * jengo
    * jnickers
    * KerrickLong
    * lenoat702
    * MobsterMonkey21
    * The_Boudzter
    * tomswartz07
    * Zagorath
* Beta Testers
    * andytuba
    * hero0fwar
    * j0be
    * matt01ss
    * siouxsie_siouxv2
