/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Revision:
 *        description: Revision
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: revision ID
 *            example: 5e0734e472560e001761fa68
 *          __v:
 *            type: number
 *            description: DB record version
 *            example: 0
 *          author:
 *            $ref: '#/components/schemas/User/properties/_id'
 *          body:
 *            type: string
 *            description: content body
 *            example: |
 *              # test
 *
 *              test
 *          format:
 *            type: string
 *            description: format
 *            example: markdown
 *          path:
 *            type: string
 *            description: path
 *            example: /user/alice/test
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */
