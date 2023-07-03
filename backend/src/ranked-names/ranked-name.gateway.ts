import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ValidationPipe } from '@nestjs/common/pipes';
import { UsePipes } from '@nestjs/common/decorators';

import { RankedNamesService } from './ranked-names.service';
import { MutateRankedNameDto, GetAllRankedNames } from './dtos';
import { Logger } from '@nestjs/common/services';

// TODO FAR BEYOND exception filter
@UsePipes(
  new ValidationPipe({
    exceptionFactory: (errors) => {
      console.log('errors', errors);
      return new WsException(errors);
    },
  }),
)
@WebSocketGateway(3001, { cors: true })
export class RankedNamesGateway {
  logger = new Logger(RankedNamesGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly rankedNamesService: RankedNamesService) {}

  @SubscribeMessage('connection')
  async handleConnection(client: Socket) {
    this.logger.log('Connected', client.id);
    // TODO handle not found
    const rankedNames = await this.rankedNamesService.getAll();
    client.emit('ranked-names-updated', rankedNames);
  }

  @SubscribeMessage('ranked-names:get-all')
  async handleGetAllRankedNames(client: Socket, payload?: GetAllRankedNames) {
    // TODO handle not found
    const rankedNames = await this.rankedNamesService.getAll(payload);
    client.emit('ranked-names-updated', rankedNames);

    return rankedNames;
  }

  @SubscribeMessage('ranked-names:update')
  async handleUpdateRankedName(
    @ConnectedSocket() client: Socket,
    @MessageBody('id') id: number,
    @MessageBody('updateDto')
    updateDto: MutateRankedNameDto,
  ) {
    if (!id || !updateDto.name) {
      client.emit(
        'error',
        'To use update you need to add id and valid updateDto',
      );
      return;
    }

    this.logger.debug(`Request to move id:${id}, to `);
    this.logger.debug(updateDto);

    try {
      await this.rankedNamesService.update(id, updateDto);
    } catch (e) {
      client.emit('error', e);
      return;
    }

    const rankedNames = await this.rankedNamesService.getAll();
    this.server.emit('ranked-names-updated', rankedNames);
    return rankedNames;
  }

  @SubscribeMessage('ranked-names:add')
  async handleAddRankedName(
    @ConnectedSocket() client: Socket,
    @MessageBody('createDto')
    createDto: MutateRankedNameDto,
  ) {
    if (!createDto.name) {
      client.emit('error', 'To use update you need to add valid createDto');
      return;
    }

    try {
      await this.rankedNamesService.add(createDto);
    } catch (e) {
      client.emit('error', e);
      return;
    }

    const rankedNames = await this.rankedNamesService.getAll();
    this.server.emit('ranked-names-updated', rankedNames);
    return rankedNames;
  }

  @SubscribeMessage('ranked-names:rename')
  async handleRenameRankedName(
    @ConnectedSocket() client: Socket,
    @MessageBody('id') id: number,
    @MessageBody('newName') newName: string,
  ) {
    if (!id || !newName) {
      client.emit(
        'error',
        'To use update you need to add valid id and newName',
      );
      return;
    }

    try {
      await this.rankedNamesService.rename(id, newName);
    } catch (e) {
      client.emit('error', e);
      return;
    }

    const rankedNames = await this.rankedNamesService.getAll();
    this.server.emit('ranked-names-updated', rankedNames);
    return rankedNames;
  }

  @SubscribeMessage('ranked-names:remove')
  async handleRemoveRankedName(
    @ConnectedSocket() client: Socket,
    @MessageBody('id') id: number,
  ) {
    if (!id) {
      client.emit('error', 'To use update you need to add valid id');
      return;
    }

    try {
      await this.rankedNamesService.remove(id);
    } catch (e) {
      client.emit('error', e);
      return;
    }

    const rankedNames = await this.rankedNamesService.getAll();
    this.server.emit('ranked-names-updated', rankedNames);
    return rankedNames;
  }
}
