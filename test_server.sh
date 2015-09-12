#!/bin/bash

ROOT=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

echo "ROOT ${ROOT}"
node ${ROOT}/test/bin/run_test_host.js
