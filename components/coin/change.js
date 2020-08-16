import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

const getBadgeStyles = (value: number): Array<any> => [
    styles.badge,
    value < 0 ? styles.bad : (value > 0 ? styles.good : styles.same)
];

export default class Change extends PureComponent {
    props: {
        value: ?number
    };

    render() {
        const { value: input } = this.props
        const value: number = input || 0
        const icon = value === 0 || !value
            ? <Text>{' '}</Text>
            : <Icon name={value < 0 ? 'caret-down' : 'caret-up'} style={styles.icon} />;
        return (
            <View style={getBadgeStyles(value)}>
                {icon}
                <Text styles={styles.value} numberOfLines={1}>
                    {Math.abs(value)}%
                </Text>
            </View>
        ); 
    };
};

const styles = StyleSheet.create({
    badge: {
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 5,
        paddingRight: 5,
        minHeight: 16
    },

    good: { backgroundColor: '#4caf50' },
    bad: { backgroundColor: '#ff5505' },
    same: { backgroundColor: '#f5a623' },
    
    value: {
        color: '#ffffff',
        fontFamily: 'Avenir',
        fontSize: 11,
        marginTop: 0
    },
    
    icon: {
        fontSize: 18,
        lineHeight: 16,
        marginRight: 2,
        color: '#ffffff',
        backgroundColor: 'transparent',
        textAlign: 'center',
    }
  });