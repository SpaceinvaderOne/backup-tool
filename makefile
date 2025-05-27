PLUGIN_NAME="rsync-backup-manager"
VERSION="2024.03.24"

all: clean package md5

package:
	@echo "Building plugin package..."
	@cd archive && \
	tar --exclude='*.tgz' -czf ../$(PLUGIN_NAME)-$(VERSION).tgz .

md5:
	@echo "Calculating MD5..."
	@md5sum $(PLUGIN_NAME)-$(VERSION).tgz | awk '{print $$1}' > md5.txt
	@echo "Updating PLG file..."
	@sed -i.bak "s/<!ENTITY md5 \".*\">/<!ENTITY md5 \"$(shell cat md5.txt)\">/g" $(PLUGIN_NAME).plg
	@rm -f md5.txt $(PLUGIN_NAME).plg.bak

clean:
	@echo "Cleaning up..."
	@rm -f $(PLUGIN_NAME)-*.tgz md5.txt *.bak

.PHONY: all clean package md5 