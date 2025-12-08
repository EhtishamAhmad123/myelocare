# Run This Simulation

clone the repo

```
git clone https://github.com/anasimran101/myelocare.git
```

clone the MMDB dataset in root folder   



```
cd myelocare
mkdir datasets
cd datasets
git clone https://github.com/LabIA-UFBA/MMDB.git
```

Then adjust the configurations in yolosimulation/config.py and pyproject.toml

To run on GPU from root

```
flwr run . local-simulation-gpu
```

or run the automation script (you can change the run configs before execution in scripts/run_project.sh)

```
chmod +x scripts/run_project.sh
./scripts/run_project.sh

```

Results will be saved in runs folder

#  **Dependencies**
```
pip install wandb flwr
pip install -U [flwr-simulation]
```



Here are the **final, clean configs for BOTH machines**, updated properly.

---

## **1. WSL CONFIGS**

## **System A (GTX 1080, i7-6700, 16GB RAM)**

Most stable configuration:

```
[wsl2]
memory=12GB
processors=4
swap=16GB
localhostForwarding=true
```

Reason:

* Windows needs ~3–4GB
* YOLO + Ray need ~8–10GB inside WSL
* Avoids memory pressure and Raylet crashes

---

## **System B (RTX 4000, 12th-gen i7, 32GB RAM)**

This machine can handle much more:

```
[wsl2]
memory=20GB
processors=8
swap=24GB
localhostForwarding=true
```

Why 24GB and not 28–30GB?

* WSL memory is not reclaimed immediately → allocating too much makes Windows unstable
* 24GB leaves Windows with ~8GB for background tasks
* Enough RAM for **heavy YOLO + Ray** simulations
* Gives Raylet plenty of object-store space
* Avoids swapping

---

## ALSO REQUIRED ON BOTH SYSTEMS

Fix `/dev/shm` (critical for Ray):

Edit:

```
sudo nano /etc/fstab
```

Add:

```
tmpfs /dev/shm tmpfs defaults,size=4G 0 0
```

Apply:

```
sudo mount -o remount /dev/shm
```

---

## **2. FINAL Flower/Ray CONFIG (`pyproject.toml`)**

These lines now work safely on **both** machines, including the 32GB machine.

```toml
[tool.flwr.federations.local-simulation-gpu]
options.num-supernodes = 3
# Ray backend configuration: safe for YOLO
options.backend.client-resources.num-cpus = 2
options.backend.client-resources.num-gpus = 0.5
```

---
