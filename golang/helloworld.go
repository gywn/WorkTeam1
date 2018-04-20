package main

import (
"fmt"
api "github.com/Rhein-Neckar-Verkehr/golang-rnv-api"
)

func main(){
	HafasId:="626"
	nullTime:="null"
	// parameter fuer haltestellenmonitor
        stationMonitorQueryParameter:=api.JourneyParams{HafasId,&nullTime,nil,api.GetSupportedModes()[0],api.GetSupportedNeedPlatformDetail()[0],nil}
	// Rest Abfrage haltstellenmonitor
	monitor,_:=api.GetStationMonitor(stationMonitorQueryParameter)
        line:=monitor.ListOfDepartures[0]
	//lines,_:=line.GetLineJourney(station.HafasId)
	//log.Println(lines)
	fmt.Println(monitor)
	fmt.Println(line)
}
