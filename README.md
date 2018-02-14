# RAP Random Album Player for MPD (Music player dameon)
A bunch of code picked here and there with ugly additions to have it do what I want: show an HTTP interface showing Albums, and propose a few of them in Random order.
No artifical intelligence was hurt in the process

Angular is used, bootstrap (a little, the CSS), and a bunch of other compoenents.
You need to install MPD for this to work. It requires that your music dB is well sorted.

It's a plain web server, but it behaves from ok to nice for touch devices like smartphones & tablets. That's how I use it. I don't see the point in using an APP, as MPD is a server.

This version is very rough and requires that you look into the code to understand what it does. In particular it has no configuration file.


# (no) Support
With the help of whoever you believe in, you might install it and have it work.
This is not packaged, and I can't support this by lack of time.

# Licenses
Not really sure. 
Many code from many parts make this too complex to tell (is it GPLed from one module being linked ? probably)
For any original new code it's MIT.

# How to install
Not yet packaged with npm or anything. 
So just copy the archive on your Linux machine (in /opt/rap, for instance), and run it (node bin/www). Use forever or PM2 to have it restart if it fails. Edit /etc/rc.local to run it at startup time.

# Is based on (for what I know)
- [mpd-nodejs-client](https://github.com/kpillis/mpd-nodejs-client)
This is where I downloaded what I used as an already advanced and working base for this player. I actually only added some bells and whistles that I liked (and messed with the code)
Big thanks to its developper Krisztián Pillis.
