//Ardublockly
const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const ipc = electron.ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1280, height: 720, frame: true});


  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

    initIpc();
  
}



function initIpc (){
//Example

  ipc.on('openIDE', function(event, arg) {
    master.listSketches(function(list) {
        event.sender.send('sketches',list);
        var child = require('child_process').execFile;
        var executablePath = "arduino/arduino-builder.exe";
        var parameters = [""];

        child(executablePath, parameters, function(err, data) {
            console.log(err)
            console.log(data.toString());
        });
    });
  });

  //Event for saving ino file
  ipc.on('code', function(event, arg) {
      var fs = require('fs');
      try { fs.writeFileSync('arduino/sketch/sketch.ino', arg, 'utf-8'); }
      catch(e) { alert('Failed to save the file !'); }
  });


  ipc.on('set-compiler', function(event) {
    var fs = require('fs');

    try {
      var path = 'settings.ini';
      fs.readFile(path , 'utf-8', (err, data) => {
        if(err){
          console.log("An error ocurred reading the file :" + err.message);
          return;
        }
        fileContent = data;
        jsonSetting = null;
        try {jsonSetting = JSON.parse(fileContent);}catch(e){console.log(e);}
        if(jsonSetting == null){ 
          jsonSetting = {"compiler":"","serialport":""};
        }

        //Open Filebrowser
        const {dialog} = require('electron');
        compilerLocation = dialog.showOpenDialog({properties: ['openFile']});

        if(compilerLocation != null){
          jsonSetting = {"compiler": compilerLocation[0],"serialport": jsonSetting.serialport};
          setting = JSON.stringify(jsonSetting);
          fs.writeFile(path, setting, (err) => {
            if(err){
              console.log("An error ocurred creating the file "+ err.message)
            }
            else{
              jsonResponse = {"element":"text_input", "display_text": compilerLocation};
              event.sender.send('compiler-request-response', JSON.stringify(jsonResponse));
            }
          });
        }
      });
    }
    catch(e) {
      console.log(e);
    }
  });




  ipc.on('compiler-request', function(event) {
    var fs = require('fs');
    try {
      var path = 'settings.ini';
      fs.readFile(path , 'utf-8', (err, data) => {
        if(err){
          console.log("An error ocurred reading the file :" + err.message);
          return;
        }
        fileContent = data;
        jsonSetting = null;
        try {jsonSetting = JSON.parse(fileContent);}catch(e){console.log(e);}
        if(jsonSetting == null){ 
          jsonSetting = {"compiler":"","serialport":""};
          jsonResponse = {"element":"text_input", "display_text": "Default"};
        }



      });
    }
    catch(e) {
      console.log(e);
    }
  });



}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
