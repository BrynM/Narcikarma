*****

[Narcikarma](http://i.imgur.com/UBVs4.png#nkma "Click for screenshot...")

*****

Narcikarma is a Google Chrome extension for keeping your karma progress here at Reddit right on the Chrome toolbar. It was written by badmonkey0001.

At a glance you can check your narcissistic progress, meaning you can stop using F5 as a weapon to see if you've been upvoted (saving finger strain, keyboard wear-and-tear, and perhaps time from Reddit being overloaded).

*****

**Features**

* Simple, out-of-the-way, and easy to use.
* Doesn't conflict with RES or any other Reddit-centric extensions.
* Two icon lines of configurable display. Each line can show gained/lost link karma, gained/lost comment karma, or status flags about your account.
* Popup panel featuring karma totals, cake day and user flags (mail, mod, mod mail, gold).
* Configurable refresh interval.
* Configurable icon colors.
* Open Source - do you want to [contribute](https://github.com/BrynM/Narcikarma)?

*****

[Get Narcikarma for Google Chrome](https://chrome.google.com/webstore/detail/narcikarma/mogaeafejjipmngijfhdjkmjomgdicdg)

^^link ^^only ^^works ^^for ^^testers ^^ATM

**Latest Version** [0.241](http://www.reddit.com/r/Narcikarma/comments/11tqcs/v024_up_for_testing/)

**Release Status** Closed Alpha

**Known Issues**

* If you can't connect to Reddit (down, lost network, etc.) "ERR/ERR" or "CON/ERR" will show on the icon
* Bug: now the undefined issue crept up to the hour readout. grrrrrr...

**Todo:**

* Decide on some color pickers for the preferences
* Get icon rows that alternate between flags and karma working
* Experiment with scrolling icon text
* Cakeday notifications
* Store version for analytics of upgrades
* Store per-account info for people who switch accounts often
* Refresh icon after options save
* Add option to persist gains until manual reset
* Add default and revert buttons for individual options
* Whip up import and export for options
* Dox. Dox. Dox.

*****

**Disclaimer**

/r/Narcikarma is a text-only subreddit, so please keep the fact that you won't be getting karma for posting there in mind.

*****

**FAQ**

* Is Narcikarma Open Source?
    * Yes. It's [GPLv3](https://github.com/BrynM/Narcikarma/blob/master/gplv3.txt)
* Can you add a(nother) icon/textbox/image/graph/readout?
    * No. For good reason, Chrome limits each extension to a single 16x16 toolbar icon as far as the main window goes. This helps them avoid the malware toolbar hell that other browsers are prone to.
* Can you report what links/comments got upvoted?
    * With a lot of work, probably. The thing is, I don't want to do that work. It would severly complicate the extension and make it far less lightweight. You should go to Reddit sometime right?
* I saw a UTM pixel. Are you gathering analytics? Private information?
    * I'm not gathering any private information. I don't want to know anything about you. I don't log your username. I don't log what you look at, where you go, what you comment or anything like that.
    * I do gather usage stats to aid me in development. For example, I log that someone (I know not who) changes a default setting to some other option. I log when some errors occur. I log how many people upgraded to the latest version.
    * Please feel free to examine the [source code](https://github.com/BrynM/Narcikarma "The actual source code on Github...") or the console to verify this.