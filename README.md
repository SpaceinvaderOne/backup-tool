# Rsync Backup Manager Plugin for Unraid

A plugin to easily manage rsync backup jobs on your Unraid server with a user-friendly interface.

## Features

- Create and manage rsync backup jobs through a simple web interface
- Support for both local and remote backups
- Flexible scheduling options (hourly, daily, weekly, monthly, or custom cron)
- Bandwidth control for network-intensive operations
- Easy-to-use file picker for local shares
- Automatic SSH key exchange for remote servers
- Job status monitoring and notifications
- Detailed logging of backup operations

## Installation

1. Open your Unraid dashboard
2. Go to the Plugins tab
3. Click "Install Plugin"
4. Enter this URL: `https://raw.githubusercontent.com/SpaceinvaderOne/backup-tool/main/rsync-backup-manager.plg`
5. Click "Install"

## Usage

1. After installation, find "Rsync Backup Manager" under the Tools menu
2. Click "Add New Backup Job" to create your first backup job
3. Configure your backup settings:
   - Give your job a name
   - Select source location (local or remote)
   - Select destination location (local or remote)
   - Choose backup schedule
   - Optionally set bandwidth limits
4. Click "Create Job" to save your backup configuration

## Scheduling Options

- Hourly: Runs at the start of every hour
- Daily: Runs at midnight each day
- Weekly: Runs at midnight on Sunday
- Monthly: Runs at midnight on the first day of each month
- Custom: Set your own cron expression

## Remote Backup Setup

When setting up remote backups:
1. Enter the remote server's IP address
2. Specify the SSH port (default: 22)
3. The plugin will automatically handle SSH key exchange
4. Select the remote path using the file picker

## Support

For support, please:
1. Check the [Issues](https://github.com/SpaceinvaderOne/backup-tool/issues) page
2. Create a new issue if your problem hasn't been reported
3. Provide logs from `/var/log/rsync-backup-manager/` when reporting issues

## Building from Source

Requirements:
- make
- tar
- md5sum

Build steps:
1. Clone the repository
2. Run `make` to create the package
3. The plugin package will be created as `rsync-backup-manager-VERSION.tgz`

## License

This project is licensed under the MIT License - see the LICENSE file for details. 