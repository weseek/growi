/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      V1ResponseOK:
 *        description: API is succeeded
 *        type: boolean
 *      V1Response:
 *        description: Response v1
 *        type: object
 *        properties:
 *          ok:
 *            $ref: '#/components/schemas/V1ResponseOK'
 *    responses:
 *      403:
 *        description: 'Forbidden'
 *      500:
 *        description: 'Internal Server Error'
 */
