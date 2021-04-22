// Side bar
$('#dashboard-sidebar').click(useDashboard);
$('#filemanager-sidebar').click(useFilemanager);
$('#favorites-sidebar').click(useFavorites);
$('#appinfo-sidebar').click(useAppinfo);
setInterval(handleClientStatus, 1000); 
 

function useDashboard(){
    console.log('useDashboard');
    $('#dashboard-sidebar').css('color', '#337ab7');
    $('#filemanager-sidebar').css('color', 'inherit');
    $('#favorites-sidebar').css('color', 'inherit');
    $('#appinfo-sidebar').css('color', 'inherit');

    // Using Component
}

function useFilemanager(){
    console.log('useFilemanager');
    $('#dashboard-sidebar').css('color', 'inherit');
    $('#filemanager-sidebar').css('color', '#337ab7');
    $('#favorites-sidebar').css('color', 'inherit');
    $('#appinfo-sidebar').css('color', 'inherit');
}

function useFavorites(){
    console.log('useFavorites');
    $('#dashboard-sidebar').css('color', 'inherit');
    $('#filemanager-sidebar').css('color', 'inherit');
    $('#favorites-sidebar').css('color', '#337ab7');
    $('#appinfo-sidebar').css('color', 'inherit');
}

function useAppinfo(){
    console.log('useAppinfo');
    $('#dashboard-sidebar').css('color', 'inherit');
    $('#filemanager-sidebar').css('color', 'inherit');
    $('#favorites-sidebar').css('color', 'inherit');
    $('#appinfo-sidebar').css('color', '#337ab7');
}

function handleClientStatus(){

    // CPU Usage
    os.cpuUsage(function(v){
        v = parseInt(v*100)
        $('#cpu-usage').html(`
            <span class="label label-primary pull-right">${v}%</span>
            <p>CPU Usage</p>
            <div class="progress progress-sm">
                <div class="progress-bar progress-bar-primary" style="width: ${v}%;">
                    <span class="sr-only">${v}%</span>
                </div>
            </div>
        `);
    });

    // Disk Usage 
    let maxSize = 200// Max Size 200MB 
    let data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let files = tree_file.files;
    let totalSize = 0;

    Object.keys(files).forEach(function(key) {
        totalSize += files[key]['size'];
    })

    totalDisk = parseInt(100*totalSize/(maxSize*1024*1024));

    setTimeout(() => {
        $('#disk-usage').html(`
            <span class="label label-purple pull-right">${totalDisk}%</span>
            <p>Disk Usage</p>
            <div class="progress progress-sm">
                <div class="progress-bar progress-bar-purple" style="width: ${totalDisk}%;">
                    <span class="sr-only">${totalDisk}%</span>
                </div>
            </div>`
        )
    }, 1000);

}
