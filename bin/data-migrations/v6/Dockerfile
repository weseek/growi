# uper v6 because old mongo shell caan't use negative lookbehind regexp
# https://www.mongodb.com/community/forums/t/does-mongo-shell-support-negative-look-behind-assertion/7956
# https://www.mongodb.com/docs/manual/release-notes/6.0-compatibility/#legacy-mongo-shell-removed
FROM mongo:6.0

# copy mongo shell scripts for migration
COPY migration.js /opt/bin/

CMD /bin/mongosh ${MONGO_URI} /opt/bin/migration.js
