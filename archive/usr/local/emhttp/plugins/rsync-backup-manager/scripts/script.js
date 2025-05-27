$(document).ready(function() {
    // Load existing backup jobs
    loadBackupJobs();

    // Initialize event handlers
    initializeEventHandlers();
});

function initializeEventHandlers() {
    // Handle source type change
    $('#sourceType').on('change', function() {
        toggleRemoteSettings('source');
    });

    // Handle destination type change
    $('#destType').on('change', function() {
        toggleRemoteSettings('dest');
    });

    // Handle schedule type change
    $('#scheduleType').on('change', function() {
        toggleCustomCron();
    });

    // Handle bandwidth limit toggle
    $('#bandwidthEnabled').on('change', function() {
        toggleBandwidthSettings();
    });

    // Handle form submission
    $('#newJobForm').on('submit', function(e) {
        e.preventDefault();
        createBackupJob();
    });
}

function toggleRemoteSettings(type) {
    const isRemote = $(`#${type}Type`).val() === 'remote';
    $(`#${type}RemoteSettings`).toggle(isRemote);
    
    // Update path picker based on local/remote selection
    updatePathPicker(type);
}

function toggleCustomCron() {
    const isCustom = $('#scheduleType').val() === 'custom';
    $('#customCron').toggle(isCustom);
}

function toggleBandwidthSettings() {
    const isEnabled = $('#bandwidthEnabled').is(':checked');
    $('#bandwidthSettings').toggle(isEnabled);
}

function addNewBackupJob() {
    $('#addJobModal').show();
}

function closeModal() {
    $('#addJobModal').hide();
    $('#newJobForm')[0].reset();
}

function createBackupJob() {
    const formData = {
        name: $('#jobName').val(),
        source: {
            type: $('#sourceType').val(),
            host: $('#sourceHost').val(),
            port: $('#sourcePort').val(),
            path: $('#sourcePath').val()
        },
        destination: {
            type: $('#destType').val(),
            host: $('#destHost').val(),
            port: $('#destPort').val(),
            path: $('#destPath').val()
        },
        schedule: {
            type: $('#scheduleType').val(),
            expression: $('#cronExpression').val()
        },
        bandwidth: {
            enabled: $('#bandwidthEnabled').is(':checked'),
            limit: $('#bandwidthLimit').val()
        }
    };

    // Send AJAX request to create job
    $.post('/plugins/rsync-backup-manager/include/api.php?action=create_job', 
        { job: JSON.stringify(formData) },
        function(response) {
            if (response.success) {
                closeModal();
                loadBackupJobs();
                addNotification('success', 'Backup job created successfully');
            } else {
                addNotification('error', response.error || 'Failed to create backup job');
            }
        }
    ).fail(function() {
        addNotification('error', 'Failed to communicate with server');
    });
}

function loadBackupJobs() {
    $.get('/plugins/rsync-backup-manager/include/api.php?action=list_jobs', function(response) {
        if (response.success) {
            displayBackupJobs(response.jobs);
        } else {
            addNotification('error', 'Failed to load backup jobs');
        }
    });
}

function displayBackupJobs(jobs) {
    const container = $('#backup-jobs-list');
    container.empty();

    jobs.forEach(job => {
        const jobElement = $(`
            <div class="backup-job">
                <h3>${job.name}</h3>
                <div class="job-details">
                    <p>Source: ${formatPath(job.source)}</p>
                    <p>Destination: ${formatPath(job.destination)}</p>
                    <p>Schedule: ${formatSchedule(job.schedule)}</p>
                    ${job.bandwidth.enabled ? 
                        `<p>Bandwidth Limit: ${job.bandwidth.limit} MB/s</p>` : 
                        '<p>No bandwidth limit</p>'}
                </div>
                <div class="job-actions">
                    <button onclick="runJob('${job.id}')" class="btn btn-primary">Run Now</button>
                    <button onclick="editJob('${job.id}')" class="btn btn-default">Edit</button>
                    <button onclick="deleteJob('${job.id}')" class="btn btn-danger">Delete</button>
                </div>
            </div>
        `);
        container.append(jobElement);
    });
}

function formatPath(location) {
    if (location.type === 'local') {
        return location.path;
    }
    return `${location.host}:${location.path}`;
}

function formatSchedule(schedule) {
    if (schedule.type === 'custom') {
        return `Custom: ${schedule.expression}`;
    }
    return schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1);
}

function runJob(jobId) {
    $.post('/plugins/rsync-backup-manager/include/api.php?action=run_job', 
        { id: jobId },
        function(response) {
            if (response.success) {
                addNotification('success', 'Backup job started');
            } else {
                addNotification('error', response.error || 'Failed to start backup job');
            }
        }
    );
}

function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this backup job?')) {
        $.post('/plugins/rsync-backup-manager/include/api.php?action=delete_job', 
            { id: jobId },
            function(response) {
                if (response.success) {
                    loadBackupJobs();
                    addNotification('success', 'Backup job deleted');
                } else {
                    addNotification('error', response.error || 'Failed to delete backup job');
                }
            }
        );
    }
}

function addNotification(type, message) {
    // Use Unraid's notification system
    addReady(() => {
        addNotice(type === 'success' ? 0 : 2, 'Rsync Backup Manager', message);
    });
}

// Path picker functionality
function updatePathPicker(type) {
    const isRemote = $(`#${type}Type`).val() === 'remote';
    const container = $(`#${type}Path`);
    
    if (isRemote) {
        // Show path input for remote
        container.html('<input type="text" class="path-input" placeholder="/mnt/user/path">');
    } else {
        // Load local path picker
        loadLocalPathPicker(container);
    }
}

function loadLocalPathPicker(container) {
    $.get('/plugins/rsync-backup-manager/include/api.php?action=list_shares', function(response) {
        if (response.success) {
            const select = $('<select class="path-input">');
            response.shares.forEach(share => {
                select.append($('<option>').val('/mnt/user/' + share).text(share));
            });
            container.html(select);
        }
    });
} 