#!/bin/bash

# 临时文件
TMP_AGENT=/tmp/punk_agent

function log() {
    log_level="$1"
    log_message="$2"
    log_full="[$(date '+%Y-%m-%d %H:%M:%S')] [$log_level] Agent - $log_message"
    echo "$log_full" | tee -a /$TMP_AGENT/agent_install.log
}

function log_info() {
    log 'INFO' "$@"
}

function log_error() {
    log 'ERROR' "$@"
}

function log_warn() {
    log 'WARN' "$@"
}

function source_default_path() {
    agent_home=$(echo $AGENT_HOME)
    if [ "X$agent_home" == "" ]; then
        log_info "AGENT_HOME is not set, source agent path"
        [ $(source ./agent_path.sh) == 0 ] || exit 1
        log_info "source agent path successfully"
    fi
}

# 检查是否安装了jq
function check_jq_install() {
    if [ "$(command -v jq)" ]; then
        log_warn "command \"jq\" exists on system"
        log_warn "jq is not installed, start the installation"
        os_name=$(awk -F= '/^NAME/{print $2}' /etc/os-release)
        if [ $os_name == 'CentOS Linux' ]; then
            log_info "begin install jq by yum"
            yum -y install jq
            if [ $? -eq 0 ]; then
                log_info "install jq success"
            else
                log_error "install jq failed"
                exit 1
            fi
        fi
    fi
}

function create_result() {
    log_info "create result file"
    echo "SCRIPT_INIT" >>agent.result
}

function validate_params() {
    echo ""
}

function save_and_result() {
    log_info "save result"
    local current_task_id=$(cat $TMP_AGENT/task.id)
    local task_status=$1

    json_result =$(cat $TMP_AGENT/task/$current_task_id.task | jq ".status=\"$task_status\"")

    log_info "the json result is $json_result"

}

function report_agent_task() {
    local id=$1
    local status=$2
    local progress=$3
    local step=$4

    curl -H "Content-Type:application/json" \
        -d "{\"id\":""$id"",\"status\":\"$status\",\"progress\":\"$progress\",\"step\":\"$step\"}" \
        -X PUT "http://$platform_ip:$platform_port/task"

    if [ $? -eq 0 ]; then
        log_info "report task status successfully"
        return 0
    fi
    log_error "report task failed"
}

function create_task() {

    local ip=$1
    local port=$2
    local agentId=$3

    log_info "begin create task on platform"
    result=$(curl -H "Content-Type:application/json" \
        -d "{\"moduleId\":"\"$agentId\"",\"module\":\"AGENT_MODULE\"}" \
        -X POST "http://$ip:$port/task")
    if [ $? -eq 0 ]; then
        log_info "create task successfully. the result is $result"
        local task_id=$result | jq ".result.task_id"
        create_tmp_path $TMP_AGENT/tasks
        cat "{\"task_id\":\"$task_id\",\"status\":\"INIT\",\"log\":\"$TMP_AGENT/agent_install.log\",\"step\":\"create agent task\"}" >$TMP_AGENT/task/$task_id.task
        cat "$task_id" >>$TMP_AGENT/task.id
    fi

    log_error "create task failed"
    exit 1

}

function download_pack() {
    log_info "begin download agent file"
    local cur_task_id=$(cat $TMP_AGENT/task.id)
    report_agent_task "$cur_task_id" "DOWNLOADING" 20 "begin download agent package"
}

function install_agent() {

    echo "$1" # arguments are accessible through $1, $2,...
}

function start_agent() {
    echo "$1" # arguments are accessible through $1, $2,...
}

function create_tmp_path() {
    mkdir -p "$1"
    if [ $? -ne 0 ]; then
        log_error "create agent tmp failed"
        exit 1
    fi
}

function main() {

    agent_id=$1
    platform_ip=$2
    platform_port=$3

    source_default_path

    check_jq_install

    create_tmp_path $TMP_AGENT

    create_task $platform_ip $platform_port $agent_id

    download_pack
}

main $@
