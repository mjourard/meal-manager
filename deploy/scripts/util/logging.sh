#!/bin/bash

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Log an error message in red
function log_error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
}

# Log a success message in green
function log_success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

# Log a warning message in yellow
function log_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

# Log an info message in blue
function log_info() {
    echo -e "${BLUE}INFO: $1${NC}"
}

# Log a step message in cyan (for steps in a process)
function log_step() {
    echo -e "${CYAN}STEP: $1${NC}"
}

# Log a debug message in magenta (for debugging)
function log_debug() {
    if [ "${DEBUG:-false}" = "true" ]; then
        echo -e "${MAGENTA}DEBUG: $1${NC}"
    fi
}

# Log a header (for section titles)
function log_header() {
    echo -e "\n${GREEN}========== $1 ==========${NC}"
}

# Log a separator line (for visual separation)
function log_separator() {
    echo -e "${YELLOW}----------------------------------------${NC}"
}

# Log command output with indentation
function log_output() {
    echo -e "${CYAN}OUTPUT:${NC}"
    echo -e "$1" | sed 's/^/  /'
}

# Check if a command exists
function check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command not found: $1"
        return 1
    fi
    return 0
}

# Export all functions to be used in other scripts
export -f log_error
export -f log_success
export -f log_warning
export -f log_info
export -f log_step
export -f log_debug
export -f log_header
export -f log_separator
export -f log_output
export -f check_command 