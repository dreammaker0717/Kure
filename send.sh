#!/bin/bash

# Sending the contents of the build folder
scp -r build/* root@kuremendocino.com:/var/www/pwa.kuremendocino.com/
