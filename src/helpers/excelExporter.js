import writeXlsxFile from 'write-excel-file'

async function exportCSV(data, colArray, fileName) {
    let objects = data
    let schema = colArray
    
    await writeXlsxFile(objects, {
      schema,
      headerStyle: {
        backgroundColor: '#eeeeee',
        fontWeight: 'bold',
        align: 'center'
      },
      fileName: fileName
    })
}

export default exportCSV