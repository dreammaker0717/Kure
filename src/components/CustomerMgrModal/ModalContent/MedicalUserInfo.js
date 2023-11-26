import React, { useEffect, useState } from 'react';
import {
  Grid,
  Button,
  Checkbox,
  Input,
  Box,
  Typography,
  List,
  ListItem,
} from '@mui/material';
import moment from 'moment';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import { Divider } from '../../../../node_modules/@mui/material/index';
import DeleteIcon from '@mui/icons-material/Delete';
import { customToast } from 'components/CustomToast/CustomToast';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { readAndCompressImage } from 'browser-image-resizer';
import CameraCaptureModal from 'components/CameraCaptureModal/CameraCaptureModal';
// import CameraCaptureWidget from 'components/CameraCaptureWidget/CameraCaptureWidget';

const MedicalUserInfo = (props) => {
  const { selectedCustomer, setSelectedCustomer } = props;
  const [newDoc, setNewDoc] = useState({});
  const [onCameraOpen, setOnCameraOpen] = useState(false);

  const { medical_user_info } = selectedCustomer;
  const field_medical_license_documents = medical_user_info ? medical_user_info.field_medical_license_documents : []
  const [description, setDescription] = useState('');

  // console.log(medical_user_info)
  const onClickDeleteDocument = (doc_index) => {
    setSelectedCustomer({
      ...selectedCustomer,
      medical_user_info: {
        ...medical_user_info,
        field_medical_license_documents: field_medical_license_documents.filter((img, index) => index != doc_index)
      }
    })
  }
  const convertToBase64 = (file) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      let image_data = reader.result;
      image_data = image_data.replace("data:image/png;base64,", "");
      image_data = image_data.replace("data:image/jpeg;base64,", "");
      console.log(image_data)
      let tmp_document = [...field_medical_license_documents, image_data];
      setSelectedCustomer({
        ...selectedCustomer,
        medical_user_info: {
          ...medical_user_info,
          field_medical_license_documents: tmp_document
        }
      });
    };
    reader.onerror = function (error) {
      console.log('convertToBase64 error: ', error);
    };
  }
  const onClickUploadFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "image/png") {
        convertToBase64(file);
      } else if (file.type === "image/jpeg") {
        const config = {
          width: 100,
          quality: 1,
          mimeType: 'jpeg'
        };
        readAndCompressImage(file, config)
          .then(resizedImage => {
            convertToBase64(resizedImage);
          })
          .catch(err => {

          })
      }
    }
  }

  const onTookImage = (imgData) => {
    setOnCameraOpen(false);
    if (imgData == null) return;
    let image_data = imgData.replace("data:image/png;base64,", "");
    let tmp_document = [...field_medical_license_documents, image_data];
    setSelectedCustomer({
      ...selectedCustomer,
      medical_user_info: {
        ...medical_user_info,
        field_medical_license_documents: tmp_document
      }
    });
  }

  return (
    <div style={{ display: selectedCustomer.is_medical_user === 'Yes' ? "block" : "none", paddingLeft: "20px" }}>
      {onCameraOpen &&
        <CameraCaptureModal
          open={onCameraOpen}
          onOK={onTookImage}
        />
      }
      <Box sx={{ pt: "10px" }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          Medical license number <code style={{ color: 'red' }}>*</code>
        </Typography>
        <input className='customer-mgr-modal-input'
          value={selectedCustomer.medical_user_info.license || ''}
          onChange={e => {
            const value = e.target.value;
            selectedCustomer.medical_user_info.license = value;
            setSelectedCustomer({ ...selectedCustomer });
          }}
        />
      </Box>
      <Box sx={{ pt: "10px" }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          Expiration date <code style={{ color: 'red' }}>*</code>
        </Typography>
        <input
          type="date"
          className='customer-mgr-modal-input'
          value={
            selectedCustomer?.medical_user_info?.expiration_date ?
              moment(selectedCustomer.medical_user_info.expiration_date).format("YYYY-MM-DD") :
              moment().format("YYYY-MM-DD")
          }
          onChange={e => {
            const value = e.target.value;
            setSelectedCustomer(prevState => ({
              ...prevState,
              medical_user_info: {
                ...prevState.medical_user_info,
                expiration_date: value
              }
            }));
          }}
        />
      </Box>

      <Box sx={{ pt: '10PX' }}>
        <Typography sx={{ fontWeight: 'bold' }}>MEDICAL LICENSE DOCUMENT(S)</Typography>
        {
          field_medical_license_documents != undefined && <Box sx={{ pl: "30px" }}>
            {field_medical_license_documents.length == 0 ?
              <Typography sx={{ mb: "10px" }}>No document, yet.</Typography>
              : <Box>
                <List>
                  {field_medical_license_documents.map((info, index) => {
                    return <ListItem sx={{ mb: "5px", borderBottom: "1px solid gray" }}
                      key={`document-item-${info}`} disablePadding>
                      <Grid container spacing={"5px"} alignItems={"center"} justifyContent="space-between">
                        <Grid item sx={{ width: "70px" }}>
                          <Zoom>
                            <img src={`data:image/jpeg;base64, ${info}`} style={{
                              width: "100%",
                              backgroundColor: 'transparent',
                            }} alt={`document-item-${info['id']}`} />
                          </Zoom>
                        </Grid>
                        {/* <Grid item>
                          <p>{info['description']}</p>
                        </Grid> */}
                        <Grid item sx={{ width: "70px" }}>
                          <Grid container alignItems={"center"}>
                            {/* <Grid item sx={{ width: "100px" }}>
                              <Typography component={"p"}>Crated at:</Typography>
                              <Typography component={"p"}>{info['created']}</Typography>
                            </Grid> */}
                            <Grid item sx={{ width: "70px" }}>
                              <Button color={"error"} startIcon={<DeleteIcon />}
                                onClick={() => {
                                  onClickDeleteDocument(index);
                                  // setSelCustomer({
                                  //   ...selCustomer,
                                  //   medical_user_info: medical_user_info.filter(x => x.id != info.id)
                                  // })
                                }}></Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </ListItem>
                  })}
                </List>
              </Box>
            }
          </Box>
        }
        <Box sx={{ pl: "50px" }}>
          {/* <CameraCaptureWidget /> */}
          <Box>
            {/* <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              // multiple
              type="file"
              onChange={onClickUploadFile}
            /> */}
            <label htmlFor="raised-button-file">
              <Button component="span" startIcon={<PhotoCamera />}
                sx={{
                  color: 'white',
                  border: '1px solid',
                  background: 'var(--primary)',
                  '&:hover': {
                    background: 'var(--primary-hover)'
                  }
                }}
                onClick={() => {
                  setOnCameraOpen(true)
                }}
              >
                Add a document image
              </Button>
            </label>
          </Box>
          {/* <Box sx={{ mt: "5px" }}>
            <textarea
              placeholder='The description for the document image'
              rows="5"
              style={{ width: "100%" }}
              value={description}
              onChange={(v) => setDescription(v.target.value)}
            />
          </Box>
          <Box sx={{ textAlign: 'right', mt: "5px" }}>
            <Button aria-label="upload picture" component="label" startIcon={<SendIcon />}
              sx={{
                color: 'white',
                border: '1px solid',
                background: 'var(--primary)',
                '&:hover': {
                  background: 'var(--primary-hover)'
                }
              }}
              onClick={onClickSubmitValue}
            >
              Submit
            </Button>
          </Box> */}
        </Box>
      </Box>
    </div>
  );
};

export default MedicalUserInfo;