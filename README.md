# RAP Random Album Player for MPD (Music player dameon) - yes, yet another
A bunch of code picked here and there with a few additions to have it do what I want.
It shows an HTTP interface showing Albums with covers, and proposes a few of them in Random order so you don't have to think too much.
No artifical intelligence was hurt in the process, though.

It's a plain web server, but it behaves from ok to nice for touch devices like smartphones & tablets, and that's primarily how I use it. 
I don't see the point in turning it into an app, as MPD is a server so a web server is handy. However that should be feasible I guess.

Node is the basis for the server.
Angular is used for the frontend, a little of bootstrap (the CSS), and a bunch of other components and awfull glue and dirty tweaks I not too proud of.

You need to install MPD for this to work! 
It's not song oriented, and it's not filesystem oriented
It requires that your music dB is reasonnably well sorted / tagged.

This version is very rough and requires that you look into the code to understand what it does. In particular it has no configuration file.

# How to install
This not (yet?) packaged with npm or anything. 

- So just copy the archive on your Linux machine (in /opt/rap, for instance).

- Then do npm install to download dependencies.

- Finally run it (node bin/www). 

- Edit /etc/rc.local to run it at startup time.

You may download and use "forever" or "PM2" to have it restart if it fails. 

# (I cant' give no) Support
With the help of whoever you believe in, you might install it and have it work.
This is not packaged, and I can't support this by lack of time.

# todos
If you are a clean programmer and have time (and like stupid challenges) you might try rewrite portions of code to clean this a bit. I might or might not do so as well, sometimes.

Some features are obviously missing, that I may complement if I need them. First taks is to list them.

# Licenses
Not really sure what it is at the end:
Lot of code from many different parts make this too complex to tell (is it GPLed from one module being linked ? probably).

For any original new code it's MIT.


# Acknowledgements and clapping
This is mostly based on a fork from
- [mpd-nodejs-client](https://github.com/kpillis/mpd-nodejs-client)
This is where I downloaded what I used as an already advanced and working base for this player.

I actually only added some bells and whistles that I liked (and messed too much with the code to dare and propose this as a pull request).

Big thanks to its developper Krisztián Pillis.

Big thanks to all authors of all modules involved in general.
