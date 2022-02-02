import React from 'react';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-navigation';
import { Divider, Box, Accordion, VStack, Button } from 'native-base';
import { styles } from '../../autocomponentContainer/AutoComponentContainer.style';
import { ScrollView } from 'react-native-gesture-handler';
import MultiButtonSelector from '../../components/buttonSelectors/MultiButtonSelector';
import NumberButtonSelector from '../../components/buttonSelectors/NumberButtonSelector';
import QuestionAutoCompleteDropDown from '../../components/dropdowns/QuestionAutoCompleteDropDown';
import DropDownSingleSelect from '../../components/dropdowns/DropDownSingleSelect';
import OpenTextField from '../../components/textFields/OpenTextField';
import OpenTextFieldWithSelection from '../../components/textFields/OpenTextFieldWithSelection';
import AdvancedOpenTextField from '../../components/textFields/AdvancedOpenTextField';
import AdvancedDropDown from '../../components/dropdowns/AdvancedDropDown';
import DropDownMultiSelect from '../../components/dropdowns/DropDownMultiSelect';
import CountyDropDown from '../../components/dropdowns/CountyDropDown';
import LargeTextField from '../../components/textFields/LargeTextField';
import QuestionHeader from '../../components/QuestionHeader';
import { updateDriver } from '../../actions/DriverAction';
import { updateNonmotorist } from '../../actions/NonmotoristAction';
import { updateVehicle } from '../../actions/VehicleAction';
import { updatePassenger } from '../../actions/PassengerAction';
import { updateRoad } from '../../actions/RoadAction';
import { updateResponse } from '../../actions/StoryActions';
import TopNavigation from '../../components/TopNavigation';

const QuestionForm = (props) => {
  const {
    questionDetail,
    navigation,
    updateResponse,
  } = props

  const question = questionDetail.questions;

  const navigateToAdvanced = (place, props) =>{
      navigation.navigate(place, props);
    }

   const questionProps = (type, res) => {
      const PublicObj = {
        data: res.data,
        key: res.data.id,
        id:res.detail.objectID,
        dependencyID:res.detail.dependencyID,
        reducer:res.setting.reducer,
        submitFunction:res.setting.submitFunction,
        updateResponse:updateResponse
      }
      const obj =
      {
        dropdown: {
          ...PublicObj
        },
        dropdownMultiSelect: {
          ...PublicObj
        },
        openTextBox: {
          ...PublicObj
        },
        openTextBoxWithSelection: {
          ...PublicObj
        },
        advancedOpenTextBox: {
           ...PublicObj,
          pageChange: navigateToAdvanced,
          importFrom: res.data.autoMethod
        },
        advancedDropDown: {
          ...PublicObj,
          pageChange: navigateToAdvanced,
          importFrom: res.data.autoMethod
        },
        countyDropDown: {
          ...PublicObj
        },
        largeTextField: {
           ...PublicObj
        },
        multiButton: {
          ...PublicObj
        },
        numberButton: {
          ...PublicObj
        },
        autoCompleteDropdown: {
          ...PublicObj
        },
        questionHeader: {
          data: res.data,
          dependencyID:res.detail.dependencyID,
        },
      }
      return  obj[type]
    }
  
   const renderSingleQuestion = (type, props) => {
      switch (type) {
        case 'dropdown':
          return (
            <DropDownSingleSelect
              {...props}
            />
          )

        case 'dropdownMultiSelect':

          return (
            <DropDownMultiSelect
              {...props}
            />
          )

        case 'openTextBox':
          const comp = (<OpenTextField
            {...props}
          />)
          return (
            comp
          )

        case 'openTextBoxWithSelection':

          return (
            <OpenTextFieldWithSelection
              {...props}
            />
          )

          case 'advancedOpenTextBox':

            return (
              <AdvancedOpenTextField
              {...props}
              />
            )

        case 'advancedDropDown':

          return (
            <AdvancedDropDown
              {...props}
            />
          )
        
        case 'countyDropDown':
          return (
            <CountyDropDown
              {...props}
            />
          )

        case 'largeTextField':
          return (
            <LargeTextField
              {...props}
            />
          )

        case 'multiButton':
          return (
            <MultiButtonSelector
              {...props}
            />
          )
        case 'numberButton':
          return (
            <NumberButtonSelector
                {...props}
            />
          )
        case 'autoCompleteDropdown':
          return (
            <QuestionAutoCompleteDropDown
              {...props}
            />
          )
        case 'questionHeader':
            return(
                <QuestionHeader
                    {...props}
                />
            )
        default:
          return null;
      }
    }

    

    const renderedQuestions = (questions) => {
      console.log('Beginning to render questions for section')
      const questionsTimer = performance.now()
      const questionList = questions.map(q => 
        renderSingleQuestion(q.answerType, 
          questionProps(q.answerType, 
            {data:q, setting: question, detail: questionDetail}))
      )
        // const questionList = questions.map(q => <RenderSingleQuestion {...questionProps(q.answerType, {data:q, setting: question, detail: questionDetail})} key={q.id} type={q.answerType}/>)
        console.log('Rendering all questions for section duration:', Math.round(performance.now() - questionsTimer))
        return (
            <VStack>
                {questionList}
            </VStack>
        )
      
    };

  const renderSingleSection = (item) => {
    const sectionTimer = performance.now()
    console.log('Beginning to render a single section')
  console.log('Render single section duration:', Math.round(performance.now() - sectionTimer))
    return (
    <Accordion.Item>
      <Accordion.Summary>
        {item.sectionTitle}
        <Accordion.Icon />
      </Accordion.Summary>
      <Accordion.Details>
        {/* <RenderedQuestions questions={item.questions}/> */}
        { renderedQuestions(item.questions) }
      </Accordion.Details>
    </Accordion.Item>)

  // return (<RenderedQuestions questions={item.questions}/>)
  }


  const RenderSections = ({question}) => {
    const sectionsTimer = performance.now()
    console.log('Beginning to render all sections')
    // const result = <Accordion index={[0]} mx={4} my={8}>{ question.questionsData.map(item => <RenderSingleSection item={item} key={item.sectionTitle}/>)}</Accordion>
    const result = <Accordion index={[0]} mx={4} my={8}>{question.questionsData.map(item => renderSingleSection(item))}</Accordion>
    console.log('Render all sections duration:', Math.round(performance.now() - sectionsTimer))
    return result
    
  }
  
  
  return (
    <SafeAreaView style={styles.container}>
      <TopNavigation title={`Questions on ${questionDetail.name}`} backButton navigation={navigation}/>
      <ScrollView>
        <Box>
            <RenderSections question={question}/>
            {/* { renderSections(question) } */}
        </Box>
      </ScrollView>
      <Divider />
      <Box p={4}>
        <Button onPress={()=> {navigation.goBack()}}>Save Progress</Button>
      </Box>
    </SafeAreaView>
  );
}

const mapDispatchToProps = {
  updateDriver,
  updateNonmotorist,
  updateVehicle,
  updatePassenger,
  updateRoad,
  updateResponse,
}

const mapStateToProps = (state) => {

  return {
      };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionForm);
