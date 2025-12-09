#!/bin/bash

source /home/anas/python_venvs/pytorch-gpu/bin/activate

EPOCHS_LIST=(1 5 10)
ROUNDS_LIST=(5 10)
LR_LIST=(0.001)

for E in "${EPOCHS_LIST[@]}"; do
  for R in "${ROUNDS_LIST[@]}"; do
    for LR in "${LR_LIST[@]}"; do

      LOG="logs/e${E}_r${R}_lr${LR}.log"
      mkdir -p logs

      echo "Running E=$E R=$R LR=$LR ..."
      flwr run . local-simulation-gpu \
        --run-config="num-server-rounds=${R} local-epochs=${E} learning-rate=${LR} batch-size=1 num-clients=3 fraction-evaluate=0.2 run-partitioner=0" \
        > "$LOG" 2>&1

      echo "Completed: $LOG"
    done
  done
done


deactivate