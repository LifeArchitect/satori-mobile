import React from 'react';
import Header from '../components/Header'
import { MapView, Constants, Location, Permissions, Notifications } from 'expo';
import RTM from "satori-rtm-sdk";

import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';

export default class HomeScreen extends React.Component {
  state = {
    latitude: 0,
    longitude: 0,
    errorMessage: null,
    alertMarkers: [],
    fiftyMileCount: 0,
  };

  static navigationOptions = {
    header: null,
    title: 'Map'
  };

  constructor(props) { 
    super(props);
    console.log("Props in home screen",props)
  }

  componentDidMount = () => {
    this.getCurrPosition()
    this.getLiveData()
  }

  componentWillUnmount = () => {
    client.unsubscribe("test_channel")
  }

  getLiveData = () => {
    var endpoint = "wss://rmkrpvqu.api.satori.com";
    var appKey = "Ecf32CF9E16bB66aC7ae656cBaef4236";
    var channel = "data_spam_channel";

    var client = new RTM(endpoint, appKey);

    client.on('enter-connected', function () {
      console.log('Connected to Satori RTM!');
    });

    client.on('rtm/subscribe/error', function (pdu) {
      console.log('Failed to subscribe. RTM replied with the error ' +
          pdu.body.error + ': ' + pdu.body.reason);
    });

    client.on('rtm/subscription/error', function (pdu) {
      console.log('Subscription failed. RTM sent the unsolicited error ' +
          pdu.body.error + ': ' + pdu.body.reason);
    });

    let currentAlertMarkers = this.state.alertMarkers
    let currentFiftyMileCount = this.state.fiftyMileCount
    var subscription = client.subscribe(channel, RTM.SubscriptionMode.SIMPLE);
    let liveDataObj = this;
    subscription.on('rtm/subscription/data', function (pdu) {
      pdu.body.messages.forEach(function (msg) {
        console.log('Got message:', msg);
        if (msg.lat && msg.lon) { 
          if (liveDataObj.calculateDistance(msg.lat,msg.lon,liveDataObj.state.latitude,liveDataObj.state.longitude,"M") <= 1000) {
            currentFiftyMileCount+=1;
            Expo.Notifications.presentLocalNotificationAsync({title:"New Alert: " +msg.disaster_type, body: "Severity: " + msg.severity || "Unknown" })
          }

          if (liveDataObj.calculateDistance(msg.lat,msg.lon,liveDataObj.state.latitude,liveDataObj.state.longitude,"M") <= 5000) {
            currentAlertMarkers.push({
            title: msg.disaster_type,
            id: msg.ROWID,
            description: msg.severity,
            severity: msg.severity,
            coordinates: {
              latitude: parseFloat(msg.lat),
              longitude: parseFloat(msg.lon)
              },
            })           
          }
      }});

      liveDataObj.setState({alertMarkers: currentAlertMarkers, fiftyMileCount: currentFiftyMileCount})
    });

    client.start();

   }

   calculateDistance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
  }

  getCurrPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
        console.log("Your position nowww", position)
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }    
    );
  } 
   
  getDisasterImage = (severity) => {
    //console.log("disaster marker")
    switch(severity) {
    case 'weather':
        return require('../assets/images/disaster/weather.png')
        break;
    case 'fire':
        return require('../assets/images/disaster/fire.png')
        break;
    case 'lightning':
        return require('../assets/images/disaster/lightning.png')
        break;
    case 'hurricane':
        return require('../assets/images/disaster/hurricane.png')
        break;  
    case 'earthquake':
        return require('../assets/images/disaster/earthquake.png')
        break; 
    case 'crime':
        return require('../assets/images/disaster/crime.png')
        break;    
    default:{
        console.log("No Image Found")
      }
}
  }

  render() {
    let marker = { latlng: 
                    { latitude: this.state.latitude, 
                      longitude: this.state.longitude
                    }
                  }
    return (
      <View style={styles.container}>
        <Header headerText="Kiasee"/>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 1.5922,
            longitudeDelta: 1.5421,
          }}
          animateToCoordinate={{coordinate:marker.latlng, duration: 10}}
        >

        <MapView.Circle 
          center={marker.latlng}
          radius={80467}
          strokeColor={this.state.fiftyMileCount > 0 ?"#ed5050" : "#4CAF50"}
          fillColor={this.state.fiftyMileCount > 0 ?"rgba(237, 80, 80, 0.3)" : "rgba(165, 214, 167, 0.3)"}//=""//"rgba(165, 214, 167, 0.3)"
        />
        <MapView.Marker
          coordinate={marker.latlng}
          image={require('../assets/images/current_location.png')}
          description="This is a description"
        >
        
        <MapView.Callout>
          <View>
            <Text>Your Current Position</Text>
            <Text>{`There are ${this.state.fiftyMileCount} alert(s) within a ${'50'} mile radius in your area`}</Text>
          </View>
        </MapView.Callout>
        </MapView.Marker>
        {this.state.alertMarkers.map((marker,i) => (
  
          <MapView.Marker 
            key={marker.id}
            coordinate={marker.coordinates}
            title={"Type:" + marker.title}
            description={`Description: ${marker.description}`}
            image={this.getDisasterImage(marker.title)}
          />
        ))}

        </MapView>          
          
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use
          useful development tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/development-mode'
    );
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
