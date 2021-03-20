import ContentUploader from 'box-ui-elements/es/elements/content-uploader/ContentUploader';

const uploader = new Box.ContentUploader();

// Show the content uploader
uploader.show(configData.FOLDER_ID, configData.ACCESS_TOKEN, {
    container: '.file-uploader-container'
});

// Log upload data to console
uploader.on('complete', (data) => { 
    console.log(`All files successfully uploaded: ${JSON.stringify(data)}`); 
});

uploader.on('upload', (data) => {
    console.log(`Successfully uploaded file with name "${data.name}" to Box File ID ${data.id}`);
});

uploader.on('error', (data) => {
    console.log(`Error uploading file with name "${data.file.name}". The error was: "${data.error}"`);
});