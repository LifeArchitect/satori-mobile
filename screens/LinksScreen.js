import React from 'react';
import { ExpoLinksView } from '@expo/samples';
import RTM from 'satori-rtm-sdk'
import { StyleSheet, Text, View, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity } from 'react-native';


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
    var endpoint = "wss://tpolcsom.api.satori.com";
    var appKey = "DcB10b9b4E92C596bE37a5D30b9eE67f";
    var channel = "test_channel";

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
    return (
        <Text style={styles.row}>Watch Out For: {item.disaster_type}</Text>
    );
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
    padding: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  jsonList: {
    fontSize: 18,
    color: '#000',
  },
});
