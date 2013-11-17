PGRestAPI - Windows Installation
=========

## Dependencies

*PhantomJS

###Install Node.js 0.10.x (0.10.15 when this project started)
Download the windows node installation package and run: http://nodejs.org/dist/v0.10.21/x64/node-v0.10.21-x64.msi

###Install PhantomJS

###Create a directory for the project and clone with GIT (or download [.zip file](https://github.com/spatialdev/PGRestAPI/archive/docs.zip) from GitHub
Create a 'PGRestAPI' directory, then:
  
    git clone https://github.com/spatialdev/PGRestAPI.git

-or-

extract files from [.zip file](https://github.com/spatialdev/PGRestAPI/archive/docs.zip) and copy to PGRestAPI folder

###Navigate to Phantasm folder, and npm install
from the console:  

    npm install


###To Run as a Windows Service
When starting as a windows service, install winser
	
	npm install -g winser


modify the package.json:  

	"scripts": {
		"start" : "node app.js",
		"install-windows-service": "winser -i",
		"uninstall-windows-service": "winser -r"
	}

Install the app as a service
	
	npm run-script install-windows-service

To Uninstall the service

	npm run-script uninstall-windows-service

Open windows task manager, find 'app'(or whatever the name property is in package.json), right click and start the service.


##Miscellaneous

