#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Jan  8 15:55:17 2024

@author: garimajindal
"""


import networkx as nx

import community
import matplotlib.pyplot as plt
import pandas as pd
import math
import itertools
import json
import numpy as np

def get_labels(G):
    label_dict = {}
    for u,v,a in G.edges(data=True):  
        label_dict[u]= u
    return label_dict

#visualize coarse graph()
def visualize(G, label_dict, pos):   
    nx.draw(G, pos, labels=label_dict)
    plt.show()
    
#which node is connected to which other nodes
def create_dictionary_of_connections(G):
    connections = {}
    for node in list(G.nodes()):
        neighbour_list =[]
        for neighbour in G.neighbors(node):
            neighbour_list.append(int(neighbour))
        connections[int(node)] = neighbour_list
    return connections

#community connections with weight or inter- community connections 
def link_data_community(induced_coarse_graph):
    source=[]
    target=[]
    weight=[]
    #printing weights of edges 
    for u,v,a in induced_coarse_graph.edges(data=True):
        if (u!=v):
            source.append(u)
            target.append(v)
            weight.append( a['WEIGHT'])
            print (u,v,a)
    
    dict = {'source': source, 'target': target, 'weight':weight} 
    df = pd.DataFrame(dict)
    return df


def link_data_symmetry(induced_coarse_graph):
    source=[]
    target=[]
    weight=[]
    #printing weights of edges 
    for u,v,a in induced_coarse_graph.edges(data=True):
        if (u!=v):
            source.append(u)
            target.append(v)
            weight.append( a['WEIGHT'])
            source.append(v)
            target.append(u)
            weight.append( a['WEIGHT'])
    
    dict = {'source': source, 'target': target, 'weight':weight} 
    df = pd.DataFrame(dict)
    return df

def link_data(graph):
    source=[]
    target=[]
    #printing weights of edges 
    for u,v,a in graph.edges(data=True):
        if (u!=v):
            source.append(u)
            target.append(v)            
    
    dict = {'source': source, 'target': target} 
    df = pd.DataFrame(dict)
    return df

#positions of coarse graph 
def coarse_graph_node_positions_to_df(pos):
    node=[]
    x_pos=[]
    y_pos=[]

    for i in  range(0, len(pos)):
        node.append(i)
        x_pos.append(pos[i][0])
        y_pos.append(pos[i][1])
    dict = {'node': node, 'x_pos': x_pos, 'y_pos':y_pos} 
    df = pd.DataFrame(dict)
    return df


def ordering_nodes(df):
    df = df.sort_values(by=["community", "centrality"], ascending=[True,True])
    return df

def density_of_subgraph(G_sub):
    n = len(G_sub.nodes())
    max_edges= n*(n-1)/2
    edges_present = len(G_sub.edges())
    density = edges_present / max_edges
    return density

def data_transformation(G, partition):
    node= list(partition.keys())
    centrality =[]
    community = list(partition.values())
    density_comm= []
   
    

    for i in range(0, len(node)):
        centrality.append(G.degree(node[i]))
        
    dict = {'node': node, 'centrality': centrality, 'community':community} 
 
    df = pd.DataFrame(dict)
    
    df = ordering_nodes(df)
        
    no_of_communities =  len(set(partition.values()))
        
    #populate id, centrality and community list
    for i in range(0,  no_of_communities):
        size_of_each_community =len([k for k,v in partition.items() if v == i])
        print(size_of_each_community)

        subgraph = G.subgraph([k for k,v in partition.items() if v == i])
        d= density_of_subgraph(subgraph)
        
        density_list = [d] * size_of_each_community
        #print(density_list)
        density_comm.extend(density_list)
    #print (density_comm)
    #print (len(density_comm))
    
    df['density'] = density_comm
        
    #dict = {'node': node, 'centrality': centrality, 'community':community, 'density':density_comm} 

    
    return df

def adding_centrality_measures_to_data(new_data):
    betw= nx.betweenness_centrality(G)
    clo= nx.closeness_centrality(G)
    eig = nx.eigenvector_centrality(G)
    
    betw_df = pd.DataFrame(list(betw.items()))
    clo_df = pd.DataFrame(list(clo.items()))
    eig_df = pd.DataFrame(list(eig.items()))
    
    betw_df.columns = ['node', 'betwness']
    clo_df.columns = ['node', 'closeness']
    eig_df.columns = ['node', 'eign']
    
    new_data = pd.merge(betw_df, new_data, on='node')
    new_data = pd.merge(clo_df, new_data, on='node')
    new_data = pd.merge(eig_df, new_data, on='node')
    
    new_data = ordering_nodes(new_data)
    
    #sorting the data and node index based on node id
    #new_data["node"] = pd.to_numeric(new_data["node"])
    #new_data= new_data.sort_values(by = 'node')
    #new_data = new_data.reset_index(drop=True)
    
    
    return new_data

def dictAfterOutlierRemovalFromDifferentCentralitities(data):
    degree_range = findOutlierRangeForInputCemtrality(data['centrality'])
    #eign_range = findOutlierRangeForInputCemtrality(data['eign'])
    #closeness_range = findOutlierRangeForInputCemtrality(data['closeness'])
    #betwness_range = findOutlierRangeForInputCemtrality(data['betwness'])
    dict_range ={}
    dict_range['degree_range'] = degree_range
    #dict_range['eign_range'] = eign_range
    #dict_range['closeness_range'] = closeness_range
    #dict_range['betwness_range'] = betwness_range
    return dict_range

def findOutlierRangeForInputCemtrality(centrality):
    range_list=[]
    
    sorted(centrality)

    quartile1 = centrality.quantile(.25)
    quartile3 = centrality.quantile(.75)
    IQR= quartile3 - quartile1

    lowerBondValue= quartile1 - (1.5* IQR)
    upperBondValue = quartile3 + (1.5* IQR)
    
    if lowerBondValue <= min(centrality):
        range_list.append(min(centrality))
    else: 
        range_list.append(lowerBondValue)
        
    if upperBondValue >= max(centrality):
        range_list.append(max(centrality))
    else: 
        range_list.append(upperBondValue)
        
    return range_list

def nodes_in_communities(partition):
    unique_communitites= list(set(partition.values()))
    number_of_nodes=[]
    for community in unique_communitites:
        count = sum(x==community for x in partition.values())
        number_of_nodes.append(count)
    dict = {'community': unique_communitites, 'count': number_of_nodes} 
    df = pd.DataFrame(dict)
    return df
    

#read graph data
G =  nx.read_edgelist("musae_git_edges.csv", delimiter=',')

#apply community detection algorithm
partition = community.community_louvain.best_partition(G)
#coarse graph
induced_coarse_graph = community.induced_graph(partition, G, weight='WEIGHT')
#inset here
#positions of spring layout
pos = nx.spring_layout(induced_coarse_graph, k=10,weight='WEIGHT') 
#labes of nodes
label_dict = get_labels(induced_coarse_graph) 
#result = label_dict.to_json(orient="records")  
#visualize coarse_graph 
visualize(induced_coarse_graph,label_dict, pos) 

#save node connections
connection_dict = create_dictionary_of_connections(G)
with open("connection_list.json", "w") as outfile:
    json.dump(connection_dict, outfile)
    
#second
#community connections with weight or inter- community connections 
#converting link data to a dataframe
link_df=link_data_community(induced_coarse_graph)
link_df_sym=link_data_symmetry(induced_coarse_graph)
link_df.to_csv('link_data.csv')
#find node to node link data (all edges)
node_to_node_link_df=link_data(G)
node_to_node_link_df.to_csv('node_to_node_link_data.csv')

#first 
df= coarse_graph_node_positions_to_df(pos)
#saving caorse graph to csv file
df.to_csv('coarse_graph_pos.csv')


#saving node data
new_data = data_transformation(G, partition)
#find number of nodes in each community
number_of_nodes_in_communities = nodes_in_communities(partition)
#order the communities based on size
number_of_nodes_in_communities = number_of_nodes_in_communities.sort_values(by=["count"], ascending=[True])
list_of_communities_based_on_size = list(number_of_nodes_in_communities["community"]) 
new_data_based_on_community_size = pd.DataFrame()
for i in list_of_communities_based_on_size:
    new_data_based_on_community_size = new_data_based_on_community_size.append(new_data[new_data["community"]==i])
    

#uncomment to add other centrality measures
#new_data = adding_centrality_measures_to_data(new_data)

new_data_based_on_community_size.to_csv('facebook_data_transformed_new.csv')

extent_of_centralitties_after_removing_outliers = dictAfterOutlierRemovalFromDifferentCentralitities(new_data)
#extent_of_centralitties_after_removing_outliers = pd.DataFrame(extent_of_centralitties_after_removing_outliers)
#extent_of_centralitties_after_removing_outliers.to_csv('new_extent_without_outliers_for_colorcoding.csv')
with open("new_extent_without_outliers_for_colorcoding.json", "w") as outfile:
    json.dump(extent_of_centralitties_after_removing_outliers, outfile)
    

number_of_nodes_in_communities.to_csv('commuity_count.csv')

