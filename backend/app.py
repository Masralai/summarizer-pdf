from flask import Flask,request,jsonify
from flask_cors import CORS #Allows frontend to talk to backend (different ports)

import sys
import datetime


app = Flask(__name__)
CORS(app)

@app.route('/health',methods=['GET'])
def health_check(): #testing
    """
    This endpoint tells us if our backend is running correctly.
    """    
    return jsonify({"status":"Backend is running!","message":"Flask server is healthy"})

@app.route('/status',methods=['GET'])
def server_status(): #server stats
    """
    information about the server(like current time, Python version, etc.)
    """
    return jsonify({
            "time": datetime.datetime.now(),
            "version":sys.version[:7]
        })


@app.route('/summarize',methods=['POST'])
def summarize_pdf():
    """
    This will be our main endpoint for processing PDFs.
    """   
    return jsonify({
            "summary": "PDF processing soon!", 
            "status": "endpoint ready"
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0',port =5000,debug=True)





