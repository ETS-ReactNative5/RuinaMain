import React, {Component} from 'react';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { StyleSheet, Alert, View, Dimensions } from 'react-native';
import { Input, Button, Text } from 'native-base';
import { MaterialDialog } from 'react-native-material-dialog';
import { material } from "react-native-typography";
import Mailer from 'react-native-mail';
import JSONconverter from '../../utils/jsonConverter';
import NetInfoAPI from "../../utils/NetAPI";
import Pdf from 'react-native-pdf';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import backgroundSave from '../../utils/backgroundSave';
import TopNavigation from '../../components/TopNavigation';
import Section from '../../components/Section';
import IconButton from '../../components/IconButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export class EmailFinalReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filename: this.getDefaultFilename(),
      devicePlatform: Platform.OS,
      reportSavedMessageVisible: false,
      reportSavedFailedMessageVisible: false,
      uri: [],
      data: [],
      encoding: [],
      format: [],
      isPDF: false,
    };
    this.changeFilename = this.changeFilename.bind(this);
    this.handleEmail = this.handleEmail.bind(this);
  }

async componentDidMount() {
    const format = this.props.navigation.state.params.format;
    console.log(format);
    // convert data to desired format
    const export_data = {
      driver: this.props.driver.data,
      nonmotorist: this.props.nonmotorist.data,
      vehicle: this.props.vehicle.data,
      passenger: this.props.passenger.data,
      road: this.props.road.data,
    };
    for (let i = 0; i < format.length; i++){
        if (format[i] === "pdf") {
          console.log("PDF LOOP")
          this.createPDF(export_data);
        } else {
          var converter = new JSONconverter();
          var file = converter.handleConverter(format[i], export_data);
          var encode = format[i] === "xlsx" ? 'ascii' : 'utf8';
          console.log('encode for html', encode);
          console.log('HTML FILE', typeof(file));
          this.state.data.push(file);
          this.state.format.push(format[i])
          console.log('data html', typeof(data[0]));

          this.state.encoding.push(encode);
//          this.setState({data: this.state.data.push(file), encoding: this.state.encoding.push(encode)});
        }
    }
  }

  // generate default filename
  getDefaultFilename() {
    var date = new Date();
    var localTime = date.toLocaleTimeString().replace(/\W/g, '.');
    var localDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    return "Crash Report " + localDate + " at " + localTime;
  }

  // update the filename
  changeFilename(text) {
    this.setState({filename: text});
  }

  // generate html and convert it into a PDF
  async createPDF(export_data) {
    var converter = new JSONconverter()
    // const htmlString = converter.handleConverter('pdftest', "");
    const htmlString = converter.handleConverter('pdf', export_data)
    let options = {
      html: htmlString,
      base64: true,
      fileName: 'crash_report',
    };
    try {
      const pdf_data = await RNHTMLtoPDF.convert(options);
      console.log("got PDF data");
//      let updated_data = [pdf_data.base64];

      this.state.uri.push(pdf_data.filePath);
      this.state.data.push(pdf_data.base64);
      this.state.isPDF= true;
      this.state.encoding.push("base64");
      this.state.format.push("pdf");
      console.log("what is uri",this.state.uri[0])
      console.log("Type of encoding",this.state.encoding[0])
    } catch (error) {
      console.log('this is the pdf converter error->', error);
    }
  }

  // save data as file inside app in order send email with attachment
  async saveDataInternal(filename) {
    var RNFS = require('react-native-fs');
    // var path = RNFS.DocumentDirectoryPath + '/' + filename;
    var path = RNFS.ExternalDirectoryPath + '/' + filename;

    // write the file
    try {
        let result = await RNFS.writeFile(path, this.state.data, this.state.encoding);
        console.log('FILE WRITTEN!');
        console.log(path);

        // clear background save
        const clearBackgroundSave = new backgroundSave();
        var deleted = await clearBackgroundSave.deleteCapturedState();
        return path;
    } catch(error) {
      console.log(error.message);
      return null;
    }
  }
  // send email based on the inputted filename
  // leave everything else blank, except subject (subject = filename)
  async sendEmail(path, filename) {
    console.log('Sending email!');
    await Mailer.mail({
      subject: "Sending " + "\"" + filename + "\"",
      recipients: [''],
      ccRecipients: [''],
      bccRecipients: [''],
      body: '',
      customChooserTitle: "Send Crash Report", // Android only (defaults to "Send Mail")
      isHTML: true,
      attachments: path,
    }, (error, event) => {
      console.log('errror', error)
      Alert.alert(
        error,
        event,
        [
          {text: 'Ok', onPress: () => console.log('OK: Email Error Response')},
          {text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response')}
        ],
        { cancelable: true }
      )
    });
  }
  // handles the entire email workflow
  async handleEmail() {
    const net = new NetInfoAPI();
    let netStatus = await net.checkNetOnce();
    // net info is wraped in net.status
    // console.log(`NetInfo: ${net.status}`);
    if (netStatus==false){
      // deal with internet not connected
      this.setState({ offlineStatus: true });
      return;
    }
    // save data internally
    var path = []
    for (let i = 0; i < this.state.format.length; i++){
        path += await this.saveDataInternal(this.state.filename + "." + this.state.format);
     }
    // send email
    await this.sendEmail(path, this.state.filename );
  }
  // required method that creates components of email screen
  render() {
    return(
      <SafeAreaView style={{flex:1}}>
        <TopNavigation id="emailNavBar" title="Email Crash Report" backButton navigation={this.props.navigation}>
            <IconButton onPress={() => {this.props.navigation.navigate('Welcome')}} icon={<Icon color="white" size={25} name='file-document-outline'/>}  text='Start New Report'/>
        </TopNavigation>
        <Section title="Edit filename below.">
            <Input
                defaultValue = {this.state.filename}
                onChangeText = {this.changeFilename}
            />
        </Section>

        {this.state.isPDF &&
          <View style={styles.container}>
            <Pdf
                source={this.state}
                enableRTL={true}
                onLoadComplete={(numberOfPages,filePath)=>{
                    console.log(`number of pages: ${numberOfPages}`);
                }}
                onError={(error)=>{
                    console.log(error);
                }}
                style={styles.pdf}/>
          </View>
        }

        <Button
          onPress={() => this.handleEmail()} m={4}>
          Send Report
        </Button>

        <MaterialDialog
          title={"Can't email when offline!"}
          visible={this.state.offlineStatus}
          onCancel={() => {
            this.setState({ offlineStatus: false });
          }}
          onOk={() => {
            this.setState({ offlineStatus: false });
          }}
        >
          <Text style={material.subheading}>
            You can not send emails while being offline.
            Please check your internet connection and try again later.
          </Text>
        </MaterialDialog>

      </SafeAreaView>
    )
  }
}

const mapStateToProps = (state) => {
    return{
        driver: state.driverReducer,
        nonmotorist: state.nonmotoristReducer,
        vehicle: state.vehicleReducer,
        passenger: state.passengerReducer,
        road: state.roadReducer
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  topContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
  },
  card: {
   flex: 1,
   margin: 2,
  },
  footerContainer: {
   flexDirection: 'row',
   justifyContent: 'flex-end',
  },
  footerControl: {
   marginHorizontal: 5,
   marginTop: 20,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  }
})

export default connect(mapStateToProps)(EmailFinalReport)
