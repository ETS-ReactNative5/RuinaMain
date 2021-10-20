import React from 'react';
import { Select } from 'native-base';
import { updateResponse } from '../../actions/StoryActions';
import { styles } from './DropDownSingleSelect.style';
import { connect } from 'react-redux';
import { dependencyParser } from '../../utils/dependencyHelper';
import TooltipView from '../Tooltip';
import Section from '../Section';

const DropDownSingleSelect = (props) => {
    const [visible, setVisible] = React.useState(false);
    const [selectedOption, setSelectedOption] = React.useState(null);
    const {data, key, id, questionReducer, submitFunction, updateResponse, dependencyID} = props;
    let currId = data.id;
    const reducerData = questionReducer.data.find(entry => entry.id == id); 
    let existingData = !reducerData?.response ? null : reducerData.response;

    if(!selectedOption) {
        if(existingData != null) {
            if(existingData[currId] != null) {
                let curOption;
                for (let i = 0; i < data.answerOptions.length; i++) {
                    if(data.answerOptions[i].text == existingData[currId]) {
                        curOption = {
                            idCode: existingData[currId],
                            text: data.answerOptions[i].text
                        };
                    };
                };
                if (curOption != null) {
                    setSelectedOption(curOption);
                }
            };
        };
    };

    const submitField = (selection) => {
        setSelectedOption(selection);
        if (dependencyID==null || dependencyID.length == 1){
            updateResponse && updateResponse({id, question: currId, selection: selection.idCode})
        }else{
            let vehicleID = dependencyID[1]
            switch (dependencyID.length) {
                case 2:
                    updateResponse && updateResponse({id, question: currId, selection: selection.idCode, vehicleID: vehicleID})
                    break;
                case 3:
                    let passengerID = dependencyID[2]
                    updateResponse && updateResponse({id, question: currId, selection: selection.idCode, vehicleID: vehicleID, passengerID: passengerID})
                case 4:
                    updateResponse && updateResponse({id, question: currId, selection: selection.idCode, vehicleID: vehicleID, nonmotoristID: dependencyID[3]})
                default:
                    break;
            }
        }
        let content = selection.text;
        submitFunction({id, question: currId, selection: content})
    }

    const HelperTooltip = () => {
        return (
             <TooltipView helperText={data.helperText} toolTip={data.tooltip} helperImg={data.helperImg}/>
        )
    }

    const items = () => {
        let itemsArr = [];
        for (item in data.answerOptions) {
            itemsArr.push(<Select.Item label={item.text} value={item.idCode} />)
        }
        return itemsArr;
    }

    let renderComponent = dependencyParser(props.response, data, dependencyID)
    if (renderComponent){
        return(
            <Section key={key} title={data.question}>
                {HelperTooltip()}
                <Select
                    selectedValue={selectedOption}
                    onSelect={(e) => submitField(e)}
                >
                    {items()}
                </Select>
            </Section>
        )
    }else{
        return null
    }
};

const mapDispatchToProps = {
    updateResponse
}

const mapStateToProps = (state, props) => {
    const { response } = state.storyReducer
    const { reducer } = props;
    const questionReducer = state[reducer];
    return { questionReducer, response }
};

export default connect(mapStateToProps, mapDispatchToProps)(DropDownSingleSelect);
