<?php
require_once 'helpers.php';

// Set content type to JSON
header('Content-Type: application/json');

// Get the action from the request
$action = $_GET['action'] ?? '';

// Handle different actions
switch ($action) {
    case 'create_job':
        handleCreateJob();
        break;
    case 'list_jobs':
        handleListJobs();
        break;
    case 'delete_job':
        handleDeleteJob();
        break;
    case 'run_job':
        handleRunJob();
        break;
    case 'list_shares':
        handleListShares();
        break;
    default:
        sendError('Invalid action');
}

function handleCreateJob() {
    try {
        $jobData = json_decode($_POST['job'], true);
        if (!$jobData) {
            throw new Exception('Invalid job data');
        }

        // Validate job data
        validateJobData($jobData);

        // Generate unique ID for the job
        $jobData['id'] = uniqid('backup_');

        // Save job configuration
        $jobs = loadJobs();
        $jobs[] = $jobData;
        saveJobs($jobs);

        // Create cron entry
        createCronEntry($jobData);

        sendSuccess(['message' => 'Job created successfully']);
    } catch (Exception $e) {
        sendError($e->getMessage());
    }
}

function handleListJobs() {
    try {
        $jobs = loadJobs();
        sendSuccess(['jobs' => $jobs]);
    } catch (Exception $e) {
        sendError($e->getMessage());
    }
}

function handleDeleteJob() {
    try {
        $jobId = $_POST['id'] ?? '';
        if (!$jobId) {
            throw new Exception('Job ID is required');
        }

        $jobs = loadJobs();
        $jobs = array_filter($jobs, function($job) use ($jobId) {
            return $job['id'] !== $jobId;
        });

        // Remove cron entry
        removeCronEntry($jobId);

        // Save updated jobs
        saveJobs(array_values($jobs));

        sendSuccess(['message' => 'Job deleted successfully']);
    } catch (Exception $e) {
        sendError($e->getMessage());
    }
}

function handleRunJob() {
    try {
        $jobId = $_POST['id'] ?? '';
        if (!$jobId) {
            throw new Exception('Job ID is required');
        }

        $jobs = loadJobs();
        $job = null;
        foreach ($jobs as $j) {
            if ($j['id'] === $jobId) {
                $job = $j;
                break;
            }
        }

        if (!$job) {
            throw new Exception('Job not found');
        }

        // Execute rsync command
        executeRsyncJob($job);

        sendSuccess(['message' => 'Job started successfully']);
    } catch (Exception $e) {
        sendError($e->getMessage());
    }
}

function handleListShares() {
    try {
        $shares = getUnraidShares();
        sendSuccess(['shares' => $shares]);
    } catch (Exception $e) {
        sendError($e->getMessage());
    }
}

function validateJobData($data) {
    if (empty($data['name'])) {
        throw new Exception('Job name is required');
    }

    if (empty($data['source']) || empty($data['destination'])) {
        throw new Exception('Source and destination are required');
    }

    if ($data['source']['type'] === 'remote') {
        if (empty($data['source']['host']) || empty($data['source']['port'])) {
            throw new Exception('Remote source requires host and port');
        }
    }

    if ($data['destination']['type'] === 'remote') {
        if (empty($data['destination']['host']) || empty($data['destination']['port'])) {
            throw new Exception('Remote destination requires host and port');
        }
    }

    if (empty($data['schedule']['type'])) {
        throw new Exception('Schedule type is required');
    }

    if ($data['schedule']['type'] === 'custom' && empty($data['schedule']['expression'])) {
        throw new Exception('Custom schedule requires cron expression');
    }

    if ($data['bandwidth']['enabled'] && empty($data['bandwidth']['limit'])) {
        throw new Exception('Bandwidth limit is required when enabled');
    }
}

function sendSuccess($data) {
    echo json_encode(array_merge(['success' => true], $data));
    exit;
}

function sendError($message) {
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit;
} 