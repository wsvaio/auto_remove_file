name="auto_remove_file"
volum="/usr/share/nginx/html/zncdz"

docker rm -fv $name
docker rmi $name

docker build -t $name .
docker run -d --name $name -v $volum:/app/volum $name
