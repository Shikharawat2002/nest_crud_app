
import { Body, Controller, Get, Param, Post, Query, Render, Req, Res, UseGuards, NestMiddleware } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GmailInboxService } from './gmailInbox.service';
import { GmailSendService } from './gmailSend.service';
import { AxiosResponse } from 'axios';
import { query } from 'express';
import { simpleFunc } from 'src/middleware';

@Controller('google')
export class GmailController {
  constructor(
    private readonly gmailInboxService: GmailInboxService,
    private readonly gmailSendService: GmailSendService,
  ) { }

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req, @Res() res) {
  }


  @Get('redirect')
  @Render('threads.hbs')
  @UseGuards(AuthGuard('google'))
  async getMailByThreadId(@Req() req) {
    //user Info
    const user = {
      accessToken: req?.user?.accessToken,
      email: req?.user?.email
    }
    const myMail = await this.gmailInboxService.getMailByThreadId(user.email, user.accessToken);
    let userDetails = [];
    myMail.forEach(element => {
      // console.log("element:;", element)
      userDetails.push({
        id: element.id,
        snippet: element.snippet,
        accessToken: user.accessToken
      })
    })
    console.log("userDetails", userDetails)
    return { message: userDetails }
  }


  @Get('threaddetails')
  @Render('chat.hbs')
  async getThreadMessage(@Query('id') id: string,
    @Query('accessToken') accessToken: string) {
    const result = await this.gmailInboxService.getThreadMessage(id, accessToken);
    console.log("REsult::", result);

    let userDetails = [];
    result.forEach(element => {
      // console.log("element:;", element)
      userDetails.push({
        threadMessage: element
      })
    })
    console.log("userDetails", userDetails)
    return { message: userDetails }
  }

  @Get('/test')
  @Render('test.hbs')
  async root(@Query('messageID') messageID?: string, @Query('email') email?: string, @Query('accessToken') accessToken?: string) {
    const mailDetail = {
      messageID: messageID,
      email: email,
      accessToken: accessToken
    }

    // console.log("mailDetail", mailDetail)
    console.log("accessToken", accessToken)
    const myMessage = await this.gmailInboxService.getReadMessage(messageID, email, accessToken)
    console.log("mymessage", myMessage);
    const message = myMessage?.snippet;
    const date = myMessage?.payload?.headers?.find((date) => date.name === 'Date');
    const from = myMessage?.payload?.headers?.find((sender) => sender.name === 'From');
    const response = {
      message: message,
      from: from.value,
      date: date.value
    }
    console.log("mymessage:::", response);
    return { message: response };
  }


  @Post('generate-response')
  // @Render('test.hbs')
  async generateEmailResponse(@Body() data: { prompt: string, snippet: string }) {
    const response = await this.gmailSendService.generateEmailResponse(data.prompt, data.snippet);
    // console.log('response:::', response)
    return { messageResponse: response };
  }


  @Get('mail')
  // @Render('index.hbs')/
  getmailList(@Query('inboxid') inboxId: string, @Query('accessToken') accessToken: string,) {
    return this.gmailInboxService.getMailList(inboxId, accessToken);

  }


  // @Get('/test')
  // getTest() {
  //   return this.gmailInboxService.getTest();
  // }


  @Get('gmail/inbox')
  getInbox(@Query('inboxid') inboxId: string,
    @Query('accessToken') accessToken: string,) {
    return this.gmailInboxService.getInbox(inboxId, accessToken);
  }


  @Get('gmail/inbox/unread')
  getInboxUnread(
    @Query('inboxid') inboxId: string,
    @Query('accessToken') accessToken: string,
  ) {
    console.log('in route:::')
    return this.gmailInboxService.getInboxUnread(inboxId, accessToken);
  }


  @Get('gmail/sent')
  getSentmessage(
    @Query('inboxid') inboxId: string,
    @Query('accessToken') accessToken: string,
  ) {
    return this.gmailInboxService.getSentMessage(inboxId, accessToken);
  }

  @Get('gmail/draft')
  getDraftMessage(
    @Query('inboxid') inboxId: string,
    @Query('accessToken') accessToken: string,
  ) {
    return this.gmailInboxService.getDraftMessage(inboxId, accessToken);
  }

  @Get('readmessage')
  getReadMessage(@Query('messageId') messageId: string,
    @Query('inboxid') inboxId: string,
    @Query('accessToken') accessToken: string,
  ) {

    return this.gmailInboxService.getReadMessage(messageId, inboxId, accessToken)
  }



  @Post('send-email')
  async sendEmail(@Body() emailContent: any): Promise<AxiosResponse<any>> {
    return this.gmailSendService.sendMail(emailContent);
  }

}