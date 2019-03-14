module.exports = {
	upload: (file, callback) => {
		try {
			const fs = require('fs');
			
			console.log(':: file url ',file.url)
			// save image on server
			fs.writeFile(file.url, file.fileData, 'binary', (err) => {
			    if (err) {
			    	console.log(':: err ',err)
			    	callback(false);
			    } else {
			    	callback(true);
			    }
			  });
		} catch (err) {
			console.log(':: fileUpload error ', err)
			callback(false)
		}
	}
}