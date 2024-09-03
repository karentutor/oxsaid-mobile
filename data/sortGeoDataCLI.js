const fs = require('fs');
const readline = require('readline');

// Create an interface for reading input from the command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to sort the geoData object
function sortGeoData(data) {
  const sortedKeys = Object.keys(data).sort();
  const sortedData = {};

  sortedKeys.forEach((key) => {
    sortedData[key] = data[key].sort();
  });

  return sortedData;
}

// Function to read the file and process sorting
function processFile(inputFile, outputFile) {
  fs.readFile(inputFile, 'utf8', (err, content) => {
    if (err) {
      console.error(`Error reading file: ${err.message}`);
      rl.close();
      return;
    }

    try {
      // Extract the JavaScript object definition from the file content
      const geoDataString = content.replace(/const\s+geoData\s*=\s*/, '').replace(/;\s*$/, '');

      // Use Function constructor to evaluate the object string safely
      const geoData = new Function(`return ${geoDataString}`)();

      // Sort the geoData object
      const sortedGeoData = sortGeoData(geoData);

      // Write the sorted data to the output file
      fs.writeFile(outputFile, `const geoData = ${JSON.stringify(sortedGeoData, null, 2)};`, (err) => {
        if (err) {
          console.error(`Error writing file: ${err.message}`);
        } else {
          console.log(`Sorted data saved to ${outputFile}`);
        }
        rl.close();
      });
    } catch (err) {
      console.error(`Error processing data: ${err.message}`);
      rl.close();
    }
  });
}

// Prompt for the input and output filenames
rl.question('Enter the JavaScript filename to read: ', (inputFile) => {
  rl.question('Enter the new filename to output the sorted data: ', (outputFile) => {
    processFile(inputFile, outputFile);
  });
});

