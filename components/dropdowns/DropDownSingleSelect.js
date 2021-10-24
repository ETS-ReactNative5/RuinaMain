import React from 'react';
import MultiSelect from 'react-native-multiple-select';
import { View, Image } from 'react-native';
import ImageSelector from '../image/imgIndex';
import { updateResponse } from '../../actions/StoryActions';
import { styles } from './DropDownSingleSelect.style';
import { connect } from 'react-redux';
import { dependencyParser } from '../../utils/dependencyHelper';
import TooltipView from '../Tooltip.js';

const DropDownSingleSelect = (props) => {
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

    let status;
    if(!existingData) {
        status = 'danger'
    } else {
        if(!existingData[currId]) {
            status = 'danger';
        } else {
            status = 'success';
        }
    }

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

    const Header = () => (
        <CardHeader title={data.question}/>
      );

    const HelperTooltip = () => {
<<<<<<< HEAD
        return (
             <TooltipView toolTip={data.tooltip} helperImg={data.helperImg}/>
        )
    }

    let renderComponent = dependencyParser(props.response, data, dependencyID)
    if (renderComponent){
        return(
            <Section
                key={key}
                title={data.question}
                isForm
                helperText={data.helperText}
            >
                {HelperTooltip()}
                <MultiSelect
                    selectedItems={selectedOption}
                    onSelectedItemsChange={(e) => submitField(e)}
                    single={true}
                    items={data.answerOptions}
                    uniqueKey={data.question.humanReadableId}
                />
            </Section>
=======
             return (
                         <TooltipView helperText={data.helperText} toolTip={data.tooltip} helperImg={data.helperImg}/>
                     )
         }

    
    const InfoIcon = (props) => (
        <Icon {...props} name='info'/>
    );
    const CloseIcon = (props) => (
        <Icon {...props} name='close-outline'/>
    );

    const toggleModal = () => {
        setVisible(!visible);
    };

    var renderComponent = dependencyParser(props.response, data, dependencyID)
    if (renderComponent){
        return(
            <Layout key={key} style={styles.container} >
                <Card header={Header} status={status}>
                    <Layout style={styles.content}>
                        {HelperTooltip()}
                        <Select
                            data={data.answerOptions}
                            selectedOption={selectedOption}
                            multiSelect={false}
                            onSelect={(e) => submitField(e)}
                        />
                    </Layout>
                </Card>
            </Layout>
>>>>>>> parent of 9bfac030... Merge branch 'feat/native-base' of github.com:santosfamilyfoundation/RuinaMain into feat/native-base
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
