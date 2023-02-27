# if the private key filename is empty
if [ -z "$6" ]
then
    # if the password is not defined
    if [ $2 = "undefined" ]
    then
        cat "$4" | ssh -T -o StrictHostKeyChecking=no -l $1 $5
    else
        # if the password is defined
        cat "$4" | sshpass -p "$2" ssh -T -o StrictHostKeyChecking=no -l $1 $5
    fi
else
    # if the private key file name is specified
    cat "$4" | ssh -T -o StrictHostKeyChecking=no -l $1  -i $6 $5
fi
