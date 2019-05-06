#!/bin/bash

inotifywait -r -m -e CREATE . | # -e CLOSE_WRITE -e CREATE js |
while read -r filename event; do
  echo $event
  #java -jar yuicompressor.jar -o '.css$:-min.css' *.css
  #java -jar /usr/bin/yuicompressor-2.4.8.jar -o test.css ./css/imgmap.css
  if [ "$event" == "CREATE imgmap.js" ]; then
    #java -jar /usr/bin/yuicompressor-2.4.8.jar -o ./js/map.min.js ./src/imgmap.js
    echo "Creating JS min file"
    java -jar /usr/bin/closure-compiler-v20181028.jar src/imgmap.js --js_output_file js/map.min.js
    echo "Completed JS min file"
  #  java -jar /usr/bin/closure-compiler-v20181028.jar js/imgmap.js --js_output_file js/map.min.js
  fi

  if [ "$event" == "CREATE imgmap.css" ]; then
    java -jar /usr/bin/yuicompressor-2.4.8.jar -o ./css/map.min.css ./src/imgmap.css
  #  java -jar /usr/bin/closure-compiler-v20181028.jar js/imgmap.js --js_output_file js/map.min.js
  fi
done


