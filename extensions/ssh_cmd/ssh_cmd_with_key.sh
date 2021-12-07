cat "$4" | ssh -T -o StrictHostKeyChecking=no -l $1 $5
