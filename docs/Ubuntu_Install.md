Phantasm - Ubuntu Installation
=========

## Dependencies

* PhantomJS

###Install Node.js 0.10.x (0.10.15 when this project started)

	sudo apt-get update
	sudo apt-get upgrade
	sudo apt-get install g++ curl libssl-dev apache2-utils git-core
	sudo apt-get install make
	sudo apt-get install python-software-properties
	sudo add-apt-repository ppa:chris-lea/node.js
	sudo apt-get update 
	sudo apt-get install nodejs

###Install Node Package Manager (npm)

	cd /tmp 
	git clone http://github.com/isaacs/npm.git 
	cd npm 
	sudo make install

###Install PhantomJS
	cd /usr/local/share
	wget https://phantomjs.googlecode.com/files/phantomjs-1.9.2-linux-x86_64.tar.bz2
	tar xjf phantomjs-1.9.2-linux-x86_64.tar.bz2
	sudo ln -s /usr/local/share/phantomjs-1.9.2-linux-x86_64/bin/phantomjs /usr/local/share/phantomjs
	sudo ln -s /usr/local/share/phantomjs-1.9.2-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs
	sudo ln -s /usr/local/share/phantomjs-1.9.2-linux-x86_64/bin/phantomjs /usr/bin/phantomjs

###Install Phantom Font dependency
	sudo apt-get install fontconfig

###Create a directory for the project and clone with GIT (or download [.zip file](https://github.com/apollolm/phantasm/archive/master.zip) from GitHub

	cd ~/ 
    git clone https://github.com/apollolm/phantasm.git


###Navigate to Phantasm folder, and npm install
from the console:  
   
	cd phantasm
	sudo npm install

###Optionally modify settings.js file

Specify the port you'd like to use.  If you want to add the IP or servername to use, you can specify that in the settings file also.
	settings.application.port = 80;
	settings.application.ip = null;

###For development purposes, install nodemon
Nodemon monitors your node project, and will automatically restart your node project if there are any file changes.
	
	npm install -g nodemon


###Run the project temporarily using node or nodemon
Start the project (assuming installs have all succeeded and you've created the settings.js file)
	
	node app.js

-or-

	nodemon app.js


###To Run as a 'service' (keeps running after you log off the machine), install forever module

	sudo npm install -g forever

### To run this project using forever:
cd to the phantasm folder, then  
	
	sudo forever start phantasm.js

### To restart forever service

	sudo forever restart 0

### To stop forever service

	sudo forever stop 0


### Add a utility to delete output files older than X minutes
Edit the crontab file to add your own script to the list of items to be scheduled.
	sudo crontab -e

Once open, add an entry (every hour, delete pngs from output folder):
	0 * * * * find ~/phantasm/output -name "*.png" -mtime + 60 -exec rm {} \;