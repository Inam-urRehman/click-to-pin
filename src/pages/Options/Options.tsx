import React, { useCallback, useEffect } from 'react';
import { Button, Divider, Form, Input, Typography } from 'antd';
import './Options.css';

interface Props {
  title: string;
}

const Options: React.FC<Props> = () => {
  const [form] = Form.useForm()
  const onFinish = (values: any) => {
    chrome.storage.sync.set(values);
    alert("Values saved")
  };

  const onFinishFailed = (errorInfo: any) => {
    alert('Failed:' + errorInfo);
  };

  const onClear = useCallback(() => {
    chrome.storage.sync.remove([...Object.keys(form.getFieldsValue()), "authToken"]).then(() => {
      form.resetFields();
    })
  }, [form])


  useEffect(() => {
    chrome.storage.sync.get(["oAuthClientId", "oAuthClientSecret", "oAuthRedirectUri"], (values) => {
      form.setFieldsValue(values);
    })
  }, [form])


  return <div className="OptionsContainer">
    <Typography.Title level={2}>Credentials</Typography.Title>
    <Form
      form={form}
      className='options-form'
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        label="oAuthClientId"
        name="oAuthClientId"
        rules={[{ required: true, message: 'Please input your oAuthClientId' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="oAuthClientSecret"
        name="oAuthClientSecret"
        rules={[{ required: true, message: 'Please input your oAuthClientSecret' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="oAuthRedirectUri"
        name="oAuthRedirectUri"
        rules={[{ required: true, message: 'Please input your oAuthRedirectUri' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
    <Divider />
    <Button type='primary' onClick={onClear}>Clear credentials</Button>
  </div>;
};

export default Options;
