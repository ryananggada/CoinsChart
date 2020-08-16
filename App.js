import React, { Component } from 'react'
import { StyleSheet, SafeAreaView, View } from 'react-native'

import Chart from './containers/chart'
import Ranges from './containers/ranges'
import List from './containers/list'

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import reducer from './redux';

const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(thunk))
);

export default class App extends Component {
  render() {
    return (
        <Provider store={store}>
          <View style={styles.container}>
            <SafeAreaView style={styles.topArea}/>
            <SafeAreaView style={styles.bottomArea}>
              <Chart />
              <Ranges />
              <List />
            </SafeAreaView> 
          </View>
        </Provider>  
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topArea: {
    flex: 0
  },
  bottomArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 128, 255, 1)'
  }

});
// 'rgba(0, 128, 255, 1)'