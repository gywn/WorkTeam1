LatDist = bsxfun(@minus,EstLat,StatLat').^2;
LonDist = bsxfun(@minus,EstLon,StatLon').^2;
DistMatrix = sqrt(LatDist+LonDist);

