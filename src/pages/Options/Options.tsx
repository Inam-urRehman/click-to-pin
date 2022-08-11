import React from 'react';
import { Button, Form, Input } from 'antd';
import './Options.css';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return <div className="OptionsContainer">
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
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
  </div>;
};

export default Options;
