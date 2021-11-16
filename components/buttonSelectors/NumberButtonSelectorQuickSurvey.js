import React from 'react';
import { connect } from 'react-redux';
import { Button, Text, HStack, Input } from 'native-base';
import { genericWriteAction } from '../../actions/GenericAction';
import {styles} from './NumberButtonSelector.style'
import { ScrollView } from 'react-native-gesture-handler';
import TooltipView from '../Tooltip.js';
import { View } from 'react-native';
import QuestionSection from '../QuestionSection';

const NumberButtonSelectorQuickSurvey = (props) => {
    const [selection, setSelection] = React.useState('');
    const {title, data, id, submitFunction, genericReducer, fieldName, updateResponse, dependencyID, startRange, endRange, tooltipText} = props;

    const submitField = (val) => {
        val = parseInt(val);
        setSelection(val);
        if (dependencyID!=null){
            const vehicleID = dependencyID[1] // Get vehicle id to identify different vehicles
            updateResponse && updateResponse({id, question: currId, selection: val, vehicleID: vehicleID})
        } else{
            updateResponse && updateResponse({id, question: currId, selection: val})
        }
        submitFunction(val);
    }

    const renderSingleButton = (num) => {
        return (
            <Button onPress={() => submitField(num)} size={10}>{num}</Button>
        )
    }

    const renderButtons = () => {
        let buttons = [];
        for (let i = startRange; i <= endRange; i++) {
            let button;
            if (i == 0) {
                button = renderSingleButton("None");
            } else {
                button = renderSingleButton(i);
            }
            buttons.push(button);
        }
        return(
            <HStack space={4}>
            {buttons}
            <Input placeholder = "other" onChangeText = {submitField} size="md"/>
            </HStack>
        )
    }

    const tooltip = () => {
        return(<TooltipView toolTip={tooltipText}/>)
    }

    return (
        <QuestionSection
          title={title}
          tooltip={tooltip()}
        >
            {renderButtons()}
        </QuestionSection>
    )
}

const mapDispatchToProps = {
    genericWriteAction
}

const mapStateToProps = (state, props) => {
    const genericReducer = state[props.reducerName];
    return { genericReducer };
};

export default connect(mapStateToProps, mapDispatchToProps)(NumberButtonSelectorQuickSurvey);