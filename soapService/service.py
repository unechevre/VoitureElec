import logging
import os
from spyne import Application, rpc, ServiceBase, Iterable, Unicode, Integer, Array, Float
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication
from wsgiref.simple_server import make_server

logging.basicConfig(level=logging.INFO)

def round_to_nearest_x6(number):
    # Calculate the rounded value
    rounded_value = number % 1  # This gives the fractional part of the number
    virgule_value = 0
    if rounded_value > 0.6:
        virgule_value = rounded_value - 0.6

    result = int(number) + 0.6 + virgule_value
    return round(result, 1)

class HelloWorldService(ServiceBase):
    @rpc(Unicode, Integer, _returns=Iterable(Unicode))
    def say_hello(ctx, name, times):
        for i in range(times):
            yield 'Hello, %s' % name

    @rpc(Integer, Integer, _returns=Integer)
    def addition(ctx, t1, t2):
        return t1 + t2

    @rpc(Array(Float), _returns=Float)
    def CalculateSum(ctx, numbers):
        return round_to_nearest_x6(sum(numbers))

if __name__ == '__main__':
    application = Application([HelloWorldService], 'spyne.examples.hello.soap',
                              in_protocol=Soap11(validator='lxml'),
                              out_protocol=Soap11())

    wsgi_application = WsgiApplication(application)
    port = int(os.environ.get('PORT', 8000))
    server = make_server('0.0.0.0', port, wsgi_application)
    server.serve_forever()
