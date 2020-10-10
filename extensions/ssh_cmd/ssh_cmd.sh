cat "$4" | sshpass -p "$2" ssh -T -o StrictHostKeyChecking=no -l $1 $5
