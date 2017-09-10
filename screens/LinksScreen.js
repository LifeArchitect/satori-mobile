import React from 'react';
import { ExpoLinksView } from '@expo/samples';
import RTM from 'satori-rtm-sdk'
import { Image, StyleSheet, Text, View, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity } from 'react-native';


export default class LinksScreen extends React.Component {

  state = {
    jsonList: [],
    random: [],
  };

  static navigationOptions = {
    title: 'List',
  };
  componentDidMount = () => {
    this.getLiveData()
  }

  getLiveData = () => {
    var endpoint = "wss://rmkrpvqu.api.satori.com";
    var appKey = "Ecf32CF9E16bB66aC7ae656cBaef4236";
    var channel = "data_spam_channel";

    var client = new RTM(endpoint, appKey);

    client.on('enter-connected', function () {
      console.log('Connected to Satori RTM!');
    });

    var subscription = client.subscribe(channel, RTM.SubscriptionMode.SIMPLE);
    let pulledData = this.state.jsonList
    let linksScreenObj = this
    subscription.on('rtm/subscription/data', function (pdu) {
      pdu.body.messages.forEach(function (msg) {
        console.log('Got message:', msg);
        pulledData.push(msg);
      });
      linksScreenObj.setState({jsonList: pulledData})
    });
    let random = this.state.random
    random.push("hello", "there", "shengs");

  client.start();
  }

  renderItem({item}) {
    console.log("item", item)
    switch (item.disaster_type) {
      case 'lightning':
      return (
        <View style={styles.row}>
          <Image source={require(`../assets/images/disaster/lightning.png`)}/>
          <Text style={styles.jsonList}>Watch Out For: {item.disaster_type}</Text>
        </View>
      );
      case 'weather':
      return (
        <View style={styles.row}>
          <Image source={require(`../assets/images/disaster/weather.png`)}/>
          <Text style={styles.jsonList}>Watch Out For: {item.disaster_type}</Text>
        </View>
      );
      case 'hurricane':
      return (
        <View style={styles.row}>
          <Image source={require(`../assets/images/disaster/hurricane.png`)}/>
          <Text style={styles.jsonList}>Watch Out For: {item.disaster_type}</Text>
        </View>
      );
      case 'fire':
      return (
        <View style={styles.row}>
          <Image source={require(`../assets/images/disaster/fire.png`)}/>
          <Text style={styles.jsonList}>Watch Out For: {item.disaster_type}</Text>
        </View>
      );
      case 'earthquake':
      return (
        <View style={styles.row}>
          <Image source={require(`../assets/images/disaster/earthquake.png`)}/>
          <Text style={styles.jsonList}>Watch Out For: {item.disaster_type}</Text>
        </View>
      );
      default:
      return (
        <View style={styles.row}>
          <Text style={styles.jsonList}>null</Text>
        </View>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList data={this.state.jsonList} renderItem={this.renderItem} keyExtractor={(item, index) => index} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flex: 1,

  },
  jsonList: {
    fontSize: 18,
    color: '#000',
    alignSelf: 'center',
  },
});
